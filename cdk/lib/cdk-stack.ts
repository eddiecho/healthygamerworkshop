import * as CodeBuild from '@aws-cdk/aws-codebuild';
import * as CodePipeline from '@aws-cdk/aws-codepipeline';
import * as CodePipelineActions from '@aws-cdk/aws-codepipeline-actions';
import * as Iam from '@aws-cdk/aws-iam';
import * as SecretsManager from '@aws-cdk/aws-secretsmanager';
import * as Cdk from '@aws-cdk/core';

interface CdkStackProps extends Cdk.StackProps {
  secretArn: string;
}

export class CdkStack extends Cdk.Stack {
  private props: CdkStackProps;

  constructor(scope: Cdk.Construct, id: string, props: CdkStackProps) {
    super(scope, id, props);
    this.props = props;

    new CodePipeline.Pipeline(this, 'HealthyGamerWorkshopPipeline', {
      restartExecutionOnUpdate: true,
      stages: this.renderPipelineStages()
    });
  }

  private renderSelfMutateProject = (): CodeBuild.PipelineProject => {
    const project = new CodeBuild.PipelineProject(this, 'SelfMutateProject', {
      buildSpec: CodeBuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: ['cd cdk', 'npm install']
          },
          build: {
            commands: ['npm run cdk deploy -- --require-approval never']
          }
        }
      }),
      environment: {
        buildImage: CodeBuild.LinuxBuildImage.STANDARD_4_0
      }
    });

    const secretPolicy = new Iam.PolicyStatement();
    secretPolicy.addActions('secretsmanager:DescribeSecret');
    secretPolicy.addResources(this.props.secretArn);

    const veryBadPolicy = new Iam.PolicyStatement();
    veryBadPolicy.addActions('*');
    veryBadPolicy.addResources('*');

    project.addToRolePolicy(secretPolicy);
    project.addToRolePolicy(veryBadPolicy);

    return project;
  };

  private renderPipelineStages = (): CodePipeline.StageProps[] => {
    const sourceOutput = new CodePipeline.Artifact();
    const sourceAuth = SecretsManager.Secret.fromSecretArn(this, 'GithubSecret', this.props.secretArn).secretValueFromJson('OAuth');

    const selfMutateOutput = new CodePipeline.Artifact();

    return [
      {
        stageName: 'GithubSource',
        actions: [
          new CodePipelineActions.GitHubSourceAction({
            actionName: 'GithubSource',
            oauthToken: sourceAuth,
            output: sourceOutput,
            owner: 'eddiecho',
            repo: 'healthygamerworkshop',
            branch: 'master',
          })
        ]
      },
      {
        stageName: 'pleasegodletthiswork',
        actions: [
          new CodePipelineActions.CodeBuildAction({
            actionName: 'SelfMutate',
            input: sourceOutput,
            outputs: [selfMutateOutput],
            project: this.renderSelfMutateProject()
          })
        ]
      }
    ]
  }

}
