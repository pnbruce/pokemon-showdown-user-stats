import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from "path";
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const addUserLambda = new lambda.Function(this, "add-user-lambda", {
      runtime: lambda.Runtime.PROVIDED_AL2023,
      handler: "does.not.matter",
      code: lambda.Code.fromAsset(path.join(__dirname, "..", "..", 
          "add-user-lambda/target/lambda/add-user-lambda")),
    });

    const bucket = new s3.Bucket(this, "user-data");
    bucket.grantReadWrite(addUserLambda);
    addUserLambda.addEnvironment('BUCKET_NAME', bucket.bucketName);
  }
}
