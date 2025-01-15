import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from "path";
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const addUserLambda = new lambda.Function(this, "add-user-lambda", {
      runtime: lambda.Runtime.PROVIDED_AL2023,
      handler: "does.not.matter",
      code: lambda.Code.fromAsset(path.join(__dirname, "..", "..", 
          "add-user-lambda/target/lambda/add-user-lambda")),
    });

    const addUserApi = new apigatewayv2.HttpApi(this, 'add-user-api', {
      apiName: 'add-user-api',
      description: 'An HTTP API to add user to begin tracking stats',
    });

    const lambdaIntegration = new integrations.HttpLambdaIntegration(
      'add-user-lambda-integration',
      addUserLambda
    );

    addUserApi.addRoutes({
      path: '/user-data',
      methods: [apigatewayv2.HttpMethod.PUT],
      integration: lambdaIntegration,
    });

    const addUserThrottleSettings: apigatewayv2.ThrottleSettings = {
      burstLimit: 200,
      rateLimit: 1000,
    };

    const apiStage = new apigatewayv2.HttpStage(this, 'add-user-http-api-stage', {
      httpApi: addUserApi,
      stageName: 'prod',
      autoDeploy: true,
      throttle: addUserThrottleSettings,
    });

    const bucket = new s3.Bucket(this, "user-data");
    bucket.grantReadWrite(addUserLambda);
    addUserLambda.addEnvironment('BUCKET_NAME', bucket.bucketName);

    new cdk.CfnOutput(this, 'api-url', {
      value: addUserApi.apiEndpoint,
      description: 'The endpoint URL of the HTTP API',
    });
  }
}
