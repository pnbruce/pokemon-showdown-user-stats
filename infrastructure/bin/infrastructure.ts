#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { InfrastructureStack } from '../lib/infrastructure-stack';
import { CertificateStack } from '../lib/certificate-stack';

const app = new cdk.App();
const cert_stack = new CertificateStack(app, 'CertificateStack', {
  env: { account: '147997160234', region: 'us-east-1' },
});
cont certificateArn = "arn:aws:acm:us-east-1:147997160234:certificate/1d921caf-d085-4cf9-8e73-bf4d631963f6";

new InfrastructureStack(app, 'InfrastructureStack', { certificateArn, 
  env: { account: '147997160234', region: 'us-west-2' },
});
