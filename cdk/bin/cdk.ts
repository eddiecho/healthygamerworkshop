#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import * as SecretsManager from 'aws-sdk/clients/secretsmanager';
import * as Route53 from 'aws-sdk/clients/route53';

import { CdkStack } from '../lib/cdk-stack';
import { BackendStack } from '../lib/backend-stack';
import { FrontendStack } from '../lib/frontend-stack';

async function describeSecret(secretId: string): Promise<SecretsManager.DescribeSecretResponse> {
  const secrets = new SecretsManager();
  const request: SecretsManager.DescribeSecretRequest = {
    SecretId: secretId,
  };

  return secrets.describeSecret(request).promise();
}

async function listHostedZones(): Promise<Route53.ListHostedZonesResponse> {
  const route53 = new Route53();

  return route53.listHostedZones().promise();
}

(async function () {
  const githubSecret = await describeSecret('GithubPersonalAccessToken');
  const hostedZones = await listHostedZones();
  const filtered = hostedZones.HostedZones.filter((zone) => zone.Name.includes('healthygamerworkshop'));
  if (filtered.length !== 1) {
    throw 'No hosted zone found';
  }

  const app = new cdk.App();

  const domainName = 'healthygamerworkshop.com';
  const frontendStack = new FrontendStack(app, 'HealthyGamerWorkshopFrontendStack', {
    hostedZoneId: filtered[0].Id,
    hostedZoneName: filtered[0].Name,
    domainName: domainName,
  });

  const backendStack = new BackendStack(app, 'HealthyGamerWorkshopBackendStack', {
    domainName: domainName,
  });

  new CdkStack(app, 'CdkStack', {
    secretArn: githubSecret.ARN as string,
    backendStackName: backendStack.stackName,
    frontendStackName: frontendStack.stackName,
    frontendStaticAssetsBucket: frontendStack.getStaticAssetsBucket(),
  });
  app.synth();
})();
