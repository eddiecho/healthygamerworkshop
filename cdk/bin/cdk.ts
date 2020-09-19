#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import * as SecretsManager from 'aws-sdk/clients/secretsmanager';

import { CdkStack } from '../lib/cdk-stack';
import { BackendStack } from '../lib/backend-stack';

async function describeSecret(secretId: string): Promise<SecretsManager.DescribeSecretResponse> {
  const secrets = new SecretsManager();
  const request: SecretsManager.DescribeSecretRequest = {
    SecretId: secretId,
  };

  return secrets.describeSecret(request).promise();
}

(async function () {
  const githubSecret = await describeSecret('GithubPersonalAccessToken');

  const app = new cdk.App();
  const backendStack = new BackendStack(app, 'HealthyGamerWorkshopBackendStack');

  new CdkStack(app, 'CdkStack', {
    secretArn: githubSecret.ARN as string,
    backendStackName: backendStack.stackName,
  });
  app.synth();
})();
