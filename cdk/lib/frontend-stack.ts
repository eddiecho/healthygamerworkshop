import * as Acm from '@aws-cdk/aws-certificatemanager';
import * as Cloudfront from '@aws-cdk/aws-cloudfront';
import * as Route53 from '@aws-cdk/aws-route53';
import * as Route53Targets from '@aws-cdk/aws-route53-targets';
import * as S3 from '@aws-cdk/aws-s3';
import * as Cdk from '@aws-cdk/core';

interface FrontendStackProps extends Cdk.StackProps {
  hostedZoneId: string;
  hostedZoneName: string;
  domainName: string;
}

export class FrontendStack extends Cdk.Stack {
  public staticAssetsBucket: S3.IBucket;

  constructor(app: Cdk.App, name: string, props: FrontendStackProps) {
    super(app, name, props);

    const hostedZone = Route53.HostedZone.fromHostedZoneAttributes(this, 'SiteHostedZone', {
      hostedZoneId: props.hostedZoneId,
      zoneName: props.hostedZoneName,
    });

    const originAccessIdentity = new Cloudfront.OriginAccessIdentity(this, 'SiteOriginAccessIdentity');
    const siteBucket = new S3.Bucket(this, 'SiteBucket', {
      websiteIndexDocument: 'index.html'
    });
    siteBucket.grantRead(originAccessIdentity);
    this.staticAssetsBucket = siteBucket;

    const certificate = new Acm.Certificate(this, 'SiteCertificate', {
      domainName: `*.${props.domainName}`,
      validationMethod: Acm.ValidationMethod.DNS,
      subjectAlternativeNames: [`www.${props.domainName}`, props.domainName]
    });

    const distribution = new Cloudfront.CloudFrontWebDistribution(this, 'SiteDistribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: siteBucket,
            originAccessIdentity: originAccessIdentity,
          },
          behaviors: [
            {
              isDefaultBehavior: true,
              defaultTtl: Cdk.Duration.minutes(15),
            }
          ]
        }
      ],
      viewerCertificate: Cloudfront.ViewerCertificate.fromAcmCertificate(certificate, {
        aliases: [`www.${props.domainName}`, props.domainName]
      }),
      priceClass: Cloudfront.PriceClass.PRICE_CLASS_100,
    });

    const siteRecord = new Route53.ARecord(this, 'SiteARecord', {
      target: Route53.RecordTarget.fromAlias(new Route53Targets.CloudFrontTarget(distribution)),
      zone: hostedZone,
    });

    const apexRecord = new Route53.ARecord(this, 'SiteApexRecord', {
      target: Route53.RecordTarget.fromAlias(new Route53Targets.CloudFrontTarget(distribution)),
      zone: hostedZone,
      recordName: `www.${props.domainName}`
    });
  }
}
