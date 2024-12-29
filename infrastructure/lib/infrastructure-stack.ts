import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from "path";
import * as lambda from 'aws-cdk-lib/aws-lambda';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const myFunction = new lambda.Function(this, "UpdateStatsLambda", {
      runtime: lambda.Runtime.PROVIDED_AL2023,
      handler: "does.not.matter",
      code: lambda.Code.fromAsset(path.join(__dirname, "..", "..", "update-stats-lambda/target/lambda/update-stats-lambda")),
    });
  }
}
