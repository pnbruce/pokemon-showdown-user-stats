import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from "path";
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as budgets from 'aws-cdk-lib/aws-budgets';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const addUserLambda = new lambda.Function(this, "AddUser", {
      runtime: lambda.Runtime.PROVIDED_AL2023,
      handler: "does.not.matter",
      code: lambda.Code.fromAsset(path.join(__dirname, "..", "..", 
          "add-user-lambda/target/lambda/add-user-lambda")),
      logRetention: logs.RetentionDays.ONE_WEEK
    });

    addUserLambda.currentVersion.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    const addUserApi = new apigatewayv2.HttpApi(this, 'AddUserApi', {
      apiName: 'add-user-api',
      description: 'An HTTP API to add user to begin tracking stats',
    });

    const lambdaIntegration = new integrations.HttpLambdaIntegration(
      'AddUserLambdaIntegration',
      addUserLambda
    );

    addUserApi.addRoutes({
      path: '/user-stats',
      methods: [apigatewayv2.HttpMethod.PUT],
      integration: lambdaIntegration,
    });

    const addUserThrottleSettings: apigatewayv2.ThrottleSettings = {
      burstLimit: 10,
      rateLimit: 100,
    };

    const apiStage = new apigatewayv2.HttpStage(this, 'AddUserHttpApiStage', {
      httpApi: addUserApi,
      stageName: 'prod',
      autoDeploy: true,
      throttle: addUserThrottleSettings,
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

    const updateStatsCluster = new ecs.Cluster(this, 'UpdateStatsFargateCluster', {
      vpc: updateStatsVpc,
    });

    const updateStatsDockerImage 
        = ecs.ContainerImage.fromAsset(path.join(__dirname, '../../update-stats'));

    const updateStatsTaskDefinition = new ecs.FargateTaskDefinition(this, 'UpdateStatsTaskDef', {
      memoryLimitMiB: 512,
      cpu: 256,
    });

    const updateStatsContainer = updateStatsTaskDefinition.addContainer('UpdateStatsContainer', {
      image: updateStatsDockerImage,
      logging: ecs.LogDriver.awsLogs({ streamPrefix: 'update-stats' }),
    });

    updateStatsContainer.addEnvironment('USER_STATS_TABLE', userStatsTable.tableName);

    userStatsTable.grantReadWriteData(updateStatsContainer.taskDefinition.taskRole);

    const updateStatsFargateService = new ecs.FargateService(this, 'UpdateStatsFargateService', {
      cluster: updateStatsCluster,
      taskDefinition: updateStatsTaskDefinition,
      desiredCount: 1,
      assignPublicIp: true
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

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: addUserApi.apiEndpoint,
      description: 'The endpoint URL of the HTTP API',
    });
  }
}
