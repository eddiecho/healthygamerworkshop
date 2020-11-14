import * as Acm from '@aws-cdk/aws-certificatemanager';
import * as ApiGateway from '@aws-cdk/aws-apigateway';
import * as Dynamo from '@aws-cdk/aws-dynamodb';
import * as Iam from '@aws-cdk/aws-iam';
import * as Lambda from '@aws-cdk/aws-lambda';
import * as Route53 from '@aws-cdk/aws-route53';
import * as Route53Targets from '@aws-cdk/aws-route53-targets';
import * as Cdk from '@aws-cdk/core';
import * as fs from 'fs';
import * as path from 'path';

interface BackendStackProps extends Cdk.StackProps {
  domainName: string;
  hostedZoneId: string;
  hostedZoneName: string;
  googleClientId: string;
}

export class BackendStack extends Cdk.Stack {
  private api: ApiGateway.RestApi;
  private baseLayer: Lambda.LayerVersion;
  private dynamoTable: Dynamo.Table;

  private props: BackendStackProps;

  constructor(app: Cdk.App, id: string, props: BackendStackProps) {
    super(app, id, props);
    this.props = props;

    this.createBaseLayer();

    this.renderTable();
    this.renderApi();

    this.renderIntegrations();
  };

  private createBaseLayer = (): void => {
    this.baseLayer = new Lambda.LayerVersion(this, 'DependenciesLayer', {
      code: Lambda.Code.fromAsset(path.join(__dirname, '../../backend/app/layer/')),
    });
  };

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
    const apiDomainName = `api.${this.props.domainName}`;
    const certificate = new Acm.Certificate(this, 'ApiCertificate', {
      domainName: apiDomainName,
      validationMethod: Acm.ValidationMethod.DNS,
    });

    const hostedZone = Route53.HostedZone.fromHostedZoneAttributes(this, 'ApiHostedZone', {
      hostedZoneId: this.props.hostedZoneId,
      zoneName: this.props.hostedZoneName,
    });

    this.api = new ApiGateway.RestApi(this, 'HealthyGamerWorkshopApi', {
      domainName: {
        domainName: apiDomainName,
        certificate: certificate,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: ApiGateway.Cors.ALL_ORIGINS,
        allowMethods: ApiGateway.Cors.ALL_METHODS,
        allowCredentials: true,
      },
    });

    new Route53.ARecord(this, 'ApiCustomNameRecord', {
      target: Route53.RecordTarget.fromAlias(
        new Route53Targets.ApiGatewayDomain(this.api.domainName as ApiGateway.DomainName)
      ),
      zone: hostedZone,
      recordName: apiDomainName,
    });
  };

  private renderIntegrations = (): void => {
    const root = this.api.root.addResource('blog');

    const list = root.addResource('list');
    this.renderListMethod(list);

    const create = root.addResource('create');
    this.renderCreateMethod(create);
  };

  private createAssetCode = (): Lambda.Code => {
    return Lambda.Code.fromAsset(path.join(__dirname, '../../backend/blogs'));
  };

  private createAuthorizerCode = (): Lambda.Code => {
    return Lambda.Code.fromAsset(path.join(__dirname, '../../backend/authorizer'));
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

  private renderAuthorizerLambda = (): Lambda.Function => {
    return new Lambda.Function(this, 'ApiAuthorizer', {
      runtime: Lambda.Runtime.PYTHON_3_8,
      code: this.createAuthorizerCode(),
      handler: 'handler.authorize',
      layers: [this.baseLayer],
      memorySize: 256,
    });
  };

  private renderCreateMethod = (resource: ApiGateway.Resource): void => {
    const createFunction = new Lambda.Function(this, 'CreateFunction', {
      runtime: Lambda.Runtime.PYTHON_3_8,
      code: this.createAssetCode(),
      handler: 'handler.create_func',
      layers: [this.baseLayer],
      memorySize: 1024,
      environment: {
        TABLE_NAME: this.dynamoTable.tableName,
      },
    });
    const createFunctionExecutionPolicy = new Iam.PolicyStatement({
      actions: ['dynamodb:PutItem'],
      effect: Iam.Effect.ALLOW,
      resources: [this.dynamoTable.tableArn],
    });
    createFunction.addToRolePolicy(createFunctionExecutionPolicy);
    createFunction.addPermission('APIGWInvoke', {
      principal: new Iam.ServicePrincipal('apigateway.amazonaws.com'),
      action: 'lambda:InvokeFunction',
      sourceArn: this.api.arnForExecuteApi(),
    });

    const requestModel = this.api.addModel('CreateRequest', {
      contentType: 'application/json',
      modelName: 'CreateRequest',
      schema: this.loadSchema('create-request.json'),
    });

    const responseModel = this.api.addModel('CreateResponse', {
      contentType: 'application/json',
      modelName: 'CreateResponse',
      schema: this.loadSchema('create-response.json'),
    });

    const integration = new ApiGateway.LambdaIntegration(createFunction, {
      allowTestInvoke: true,
      proxy: true,
    });
    const method = resource.addMethod('POST', integration, {
      authorizationType: ApiGateway.AuthorizationType.CUSTOM,
      authorizer: new ApiGateway.TokenAuthorizer(this, 'ApiGwAuthorizer', {
        handler: this.renderAuthorizerLambda(),
      }),
      apiKeyRequired: true,
      operationName: 'CreateBlog',
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

    const createInvokerRole = new Iam.Role(this, 'CreateInvokerRole', {
      assumedBy: new Iam.WebIdentityPrincipal('accounts.google.com', {
        StringEquals: {
          'accounts.google.com:aud': this.props.googleClientId,
        }
      })
    });
    createInvokerRole.addToPolicy(new Iam.PolicyStatement({
      resources: [method.methodArn],
      effect: Iam.Effect.ALLOW,
      actions: [ 'execute-api:Invoke' ]
    }));
  };

}
