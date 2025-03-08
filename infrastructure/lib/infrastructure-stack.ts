import * as cdk from 'aws-cdk-lib';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import * as budgets from 'aws-cdk-lib/aws-budgets';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import * as path from "path";

export interface InfrastructureStackProps extends cdk.StackProps {
  certificateArn: string; // ARN of the certificate created in CertificateStack
}

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: InfrastructureStackProps) {
    super(scope, id, props);

    const addUserLambda = new lambda.Function(this, "AddUser", {
      runtime: lambda.Runtime.PROVIDED_AL2023,
      handler: "does.not.matter",
      code: lambda.Code.fromAsset(path.join(__dirname, "..", "..",
        "add-user-lambda/target/lambda/add-user-lambda")),
      logRetention: logs.RetentionDays.ONE_WEEK
    });

    addUserLambda.currentVersion.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    const addUserLambdaIntegration = new integrations.HttpLambdaIntegration(
      'AddUserLambdaIntegration',
      addUserLambda
    );

    const userStatsApi = new apigatewayv2.HttpApi(this, 'UserStatsApi', {
      apiName: 'user-stats-api',
      description: 'An HTTP API to start tracking and access user statistics',
    });

    const userStatsApiPath = '/user-stats/{username}';

    userStatsApi.addRoutes({
      path: userStatsApiPath,
      methods: [apigatewayv2.HttpMethod.PUT],
      integration: addUserLambdaIntegration,
    });

    const userStatsThrottleSettings: apigatewayv2.ThrottleSettings = {
      burstLimit: 10,
      rateLimit: 100,
    };

    const userStatsApiStage = new apigatewayv2.HttpStage(this, 'UserStatsHttpApiStage', {
      httpApi: userStatsApi,
      stageName: 'prod',
      autoDeploy: true,
      throttle: userStatsThrottleSettings,
    });

    const userStatsTable = new dynamodb.Table(this, 'UserStatsTable', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
    });

    addUserLambda.addEnvironment('USER_STATS_TABLE', userStatsTable.tableName);
    userStatsTable.grantReadWriteData(addUserLambda);

    const updateStatsVpc = new ec2.Vpc(this, 'UpdateStatsVpc', {
      natGateways: 0,
      subnetConfiguration: [{
        name: 'Public',
        subnetType: ec2.SubnetType.PUBLIC,
      }]
    });

    const updateStatsLogGroup = new logs.LogGroup(this, 'UpdateStatsLogGroup', {
      logGroupName: '/ecs/update-stats',
      retention: logs.RetentionDays.ONE_WEEK, // Set log retention period
    });

    const updateStatsLogDriver = ecs.LogDriver.awsLogs({
      logGroup: updateStatsLogGroup,
      streamPrefix: 'update-stats',
    });

    const updateStatsCluster = new ecs.Cluster(this, 'UpdateStatsFargateCluster', {
      vpc: updateStatsVpc,
    });

    const updateStatsDockerImage
      = ecs.ContainerImage.fromAsset(path.join(__dirname, '../../update-stats'));

    const updateStatsTaskDefinition = new ecs.FargateTaskDefinition(this, 'UpdateStatsTaskDef', {
      memoryLimitMiB: 512,
      cpu: 256,
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.ARM64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
      },
    });

    const updateStatsContainer = updateStatsTaskDefinition.addContainer('UpdateStatsContainer', {
      image: updateStatsDockerImage,
      logging: updateStatsLogDriver,
    });

    updateStatsContainer.addEnvironment('USER_STATS_TABLE', userStatsTable.tableName);

    userStatsTable.grantReadWriteData(updateStatsContainer.taskDefinition.taskRole);

    const updateStatsFargateService = new ecs.FargateService(this, 'UpdateStatsFargateService', {
      cluster: updateStatsCluster,
      taskDefinition: updateStatsTaskDefinition,
      desiredCount: 1,
      assignPublicIp: true,
    });

    const getUserLambda = new lambda.Function(this, "GetUser", {
      runtime: lambda.Runtime.PROVIDED_AL2023,
      handler: "does.not.matter",
      code: lambda.Code.fromAsset(path.join(__dirname, "..", "..",
        "get-user-lambda/target/lambda/get-user-lambda")),
      logRetention: logs.RetentionDays.ONE_WEEK
    });

    getUserLambda.currentVersion.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    getUserLambda.addEnvironment('USER_STATS_TABLE', userStatsTable.tableName);
    userStatsTable.grantReadWriteData(getUserLambda);

    const getUserLambdaIntegration = new integrations.HttpLambdaIntegration(
      'GetUserLambdaIntegration',
      getUserLambda
    );

    userStatsApi.addRoutes({
      path: userStatsApiPath,
      methods: [apigatewayv2.HttpMethod.GET],
      integration: getUserLambdaIntegration,
    });

    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket');

    const oai = new cloudfront.OriginAccessIdentity(this, 'OAI');
    websiteBucket.grantRead(oai);

    const certificate = certificatemanager.Certificate.fromCertificateArn(
      this,
      'SiteCertificate',
      props.certificateArn
    );

    const cachePolicy = new cloudfront.CachePolicy(this, 'OneMinuteCachePolicy', {
      cachePolicyName: 'OneMinuteCachePolicy',
      defaultTtl: cdk.Duration.seconds(60),
      minTtl: cdk.Duration.seconds(60),
      maxTtl: cdk.Duration.seconds(60),
      cookieBehavior: cloudfront.CacheCookieBehavior.none(),
      headerBehavior: cloudfront.CacheHeaderBehavior.none(),
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),
    });

    const distribution = new cloudfront.Distribution(this, 'ApiDistribution', {
      domainNames: ['pokemonshowdownuserstats.com', 'www.pokemonshowdownuserstats.com'],
      certificate: certificate,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      },
      additionalBehaviors: {
        '/user-stats/*': {
          origin: new origins.HttpOrigin(
            `${userStatsApi.apiId}.execute-api.${this.region}.amazonaws.com`,
            {
              originPath: `/${userStatsApiStage.stageName}`,
              protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
            }
          ),
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cachePolicy,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        },
      },
      errorResponses: [
{
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        },
      ],
    });

    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '..', '..', 'front-end/dist'))],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: 'pokemonshowdownuserstats.com',
    });

    new route53.ARecord(this, 'AliasRecord', {
      zone: hostedZone,
      recordName: 'pokemonshowdownuserstats.com',
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });

    new route53.ARecord(this, 'WwwAliasRecord', {
      zone: hostedZone,
      recordName: 'www.pokemonshowdownuserstats.com',
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });

    new budgets.CfnBudget(this, 'FreeTierBudget', {
      budget: {
        budgetType: 'COST',
        timeUnit: 'MONTHLY',
        budgetLimit: {
          amount: 1,
          unit: 'USD'
        }
      },
      notificationsWithSubscribers: [{
        notification: {
          comparisonOperator: 'GREATER_THAN',
          threshold: 0.01,
          notificationType: 'ACTUAL'
        },
        subscribers: [{
          subscriptionType: 'EMAIL',
          address: 'patricknbruce@gmail.com'
        }]
      }]
    });

    new cdk.CfnOutput(this, 'UserStatsApiUrl', {
      value: userStatsApi.apiEndpoint,
      description: 'The endpoint URL of the UserStatsAp HTTP API',
    });
  }
}
