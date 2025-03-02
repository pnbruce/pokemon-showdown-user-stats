import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';

export class CertificateStack extends cdk.Stack {
  public readonly certificateArn: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, { ...props, env: { region: 'us-east-1' } });

    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: 'pokemonshowdownuserstats.com',
    });

    const certificate = new certificatemanager.Certificate(this, 'SiteCertificate', {
      domainName: 'pokemonshowdownuserstats.com',
      validation: certificatemanager.CertificateValidation.fromDns(hostedZone),
    });

    this.certificateArn = certificate.certificateArn;

    new cdk.CfnOutput(this, 'CertificateArn', {
      value: certificate.certificateArn,
    });
  }
}
