import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from "path";
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const addUserLambda = new lambda.Function(this, "AddUser", {
      runtime: lambda.Runtime.PROVIDED_AL2023,
      handler: "does.not.matter",
      code: lambda.Code.fromAsset(path.join(__dirname, "..", "..", 
          "add-user-lambda/target/lambda/add-user-lambda")),
    });

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
      burstLimit: 200,
      rateLimit: 1000,
    };

    const apiStage = new apigatewayv2.HttpStage(this, 'AddUserHttpApiStage', {
      httpApi: addUserApi,
      stageName: 'prod',
      autoDeploy: true,
      throttle: addUserThrottleSettings,
    });

    const updateStatsLambda = new lambda.Function(this, "UpdateStats", {
      runtime: lambda.Runtime.PROVIDED_AL2023,
      handler: "does.not.matter",
      code: lambda.Code.fromAsset(path.join(__dirname, "..", "..", 
          "update-stats-lambda/target/lambda/update-stats-lambda")),
    });

    const updateStatsEventRule = new events.Rule(this, 'UpdateStatsTrigger', {
      schedule: events.Schedule.rate(cdk.Duration.minutes(1)),
    });

    updateStatsEventRule.addTarget(new targets.LambdaFunction(updateStatsLambda));

    const userStatsTable = new dynamodb.Table(this, 'UserStatsTable', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING }
    });

    addUserLambda.addEnvironment('USER_STATS_TABLE', userStatsTable.tableName);
    updateStatsLambda.addEnvironment('USER_STATS_TABLE', userStatsTable.tableName);
    userStatsTable.grantReadWriteData(addUserLambda);
    userStatsTable.grantReadWriteData(updateStatsLambda);

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: addUserApi.apiEndpoint,
      description: 'The endpoint URL of the HTTP API',
    });
  }
}
