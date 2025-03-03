#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { InfrastructureStack } from '../lib/infrastructure-stack';
import { CertificateStack } from '../lib/certificate-stack';

const app = new cdk.App();
new InfrastructureStack(app, 'InfrastructureStack', {
  env: { account: '147997160234', region: 'us-west-2' },
});
new CertificateStack(app, 'CertificateStack', {
  env: { account: '147997160234', region: 'us-east-1' },
});