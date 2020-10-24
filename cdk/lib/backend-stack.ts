import * as Acm from '@aws-cdk/aws-certificatemanager';
import * as ApiGateway from '@aws-cdk/aws-apigateway';
import * as Dynamo from '@aws-cdk/aws-dynamodb';
import * as Iam from '@aws-cdk/aws-iam';
import * as Lambda from '@aws-cdk/aws-lambda';
import * as Cdk from '@aws-cdk/core';
import * as fs from 'fs';
import * as path from 'path';

interface BackendStackProps extends Cdk.StackProps {
  domainName: string;
}

export class BackendStack extends Cdk.Stack {
  private api: ApiGateway.RestApi;
  private baseLayer: Lambda.LayerVersion;
  private dynamoTable: Dynamo.Table;

  private props: BackendStackProps;

  constructor(app: Cdk.App, id: string, props: BackendStackProps) {
    super(app, id, props);
    this.props = props;

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
    const certificate = new Acm.Certificate(this, 'ApiCertificate', {
      domainName: `api.${this.props.domainName}`,
      validationMethod: Acm.ValidationMethod.DNS,
    });

    this.api = new ApiGateway.RestApi(this, 'HealthyGamerWorkshopApi', {
      domainName: {
        domainName: `api.${this.props.domainName}`,
        certificate: certificate,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: [ ApiGateway.Cors.ALL_ORIGINS ],
        allowCredentials: true,
        allowMethods: [ 'POST' ],
      }
    });
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
  };

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
      schema: this.loadSchema('list-request.json'),
    });

    const responseModel = this.api.addModel('ListResponse', {
      contentType: 'application/json',
      modelName: 'ListResponse',
      schema: this.loadSchema('list-response.json'),
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
            'application/json': responseModel,
          },
        },
      ],
    });
  };
}
