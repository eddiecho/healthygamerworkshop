import * as ApiGateway from '@aws-cdk/aws-apigateway';
import * as Dynamo from '@aws-cdk/aws-dynamodb';
import * as Iam from '@aws-cdk/aws-iam';
import * as Lambda from '@aws-cdk/aws-lambda';
import * as Cdk from '@aws-cdk/core';
import * as fs from 'fs';
import * as path from 'path';

export class BackendStack extends Cdk.Stack {
  private api: ApiGateway.RestApi;
  private baseLayer: Lambda.LayerVersion;
  private dynamoTable: Dynamo.Table;

  constructor(app: Cdk.App, id: string, props?: Cdk.StackProps) {
    super(app, id, props);

    this.renderTable();
    this.renderApi();

    this.renderIntegrations();
  }

  private renderTable = (): void => {
    this.dynamoTable = new Dynamo.Table(this, 'BlogsTable', {
      billingMode: Dynamo.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'Id',
        type: Dynamo.AttributeType.STRING,
      },
      sortKey: {
        name: 'CreationTime',
        type: Dynamo.AttributeType.NUMBER,
      },
    });
  };

  private renderApi = (): void => {
    this.api = new ApiGateway.RestApi(this, 'HealthyGamerWorkshopApi', {});
  };

  private renderIntegrations = (): void => {
    const root = this.api.root.addResource('blog');
    const list = root.addResource('list');
    this.renderListMethod(list);
  };

  private createAssetCode = (): Lambda.Code => {
    this.baseLayer = new Lambda.LayerVersion(this, 'DependenciesLayer', {
      code: Lambda.Code.fromAsset(path.join(__dirname, '../../backend/app/layer/')),
    });
    return Lambda.Code.fromAsset(path.join(__dirname, '../../backend/blogs'));
  };

  private loadSchema = (filepath: string): ApiGateway.JsonSchema => {
    const buffer = fs.readFileSync(path.join(__dirname, '../../model', filepath));
    return JSON.parse(buffer.toString()) as ApiGateway.JsonSchema;
  }

  private renderListMethod = (resource: ApiGateway.Resource): void => {
    const listFunction = new Lambda.Function(this, 'ListFunction', {
      runtime: Lambda.Runtime.PYTHON_3_8,
      code: this.createAssetCode(),
      handler: 'handler.list_func',
      layers: [this.baseLayer],
      memorySize: 256,
      environment: {
        TABLE_NAME: this.dynamoTable.tableName,
      },
    });
    const listFunctionExecutionPolicy = new Iam.PolicyStatement({
      actions: ['dynamodb:Scan'],
      effect: Iam.Effect.ALLOW,
      resources: [this.dynamoTable.tableArn],
    });
    listFunction.addToRolePolicy(listFunctionExecutionPolicy);
    listFunction.addPermission('APIGWInvoke', {
      principal: new Iam.ServicePrincipal('apigateway.amazonaws.com'),
      action: 'lambda:InvokeFunction',
      sourceArn: this.api.arnForExecuteApi(),
    });

    const requestModel = this.api.addModel('ListRequest', {
      contentType: 'application/json',
      modelName: 'ListRequest',
      schema:this.loadSchema('list-request.json'),
    });

    const responseModel = this.api.addModel('ListResponse', {
      contentType: 'application/json',
      modelName: 'ListResponse',
      schema:this.loadSchema('list-response.json'),
    });

    const integration = new ApiGateway.LambdaIntegration(listFunction, {
      allowTestInvoke: true,
      proxy: true,
    });
    resource.addMethod('POST', integration, {
      operationName: 'ListBlogs',
      requestModels: {
        'application/json': requestModel,
      },
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': responseModel
          },
        },
      ]
    });
  };
}
