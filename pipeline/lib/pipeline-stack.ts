import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as codestar from 'aws-cdk-lib/aws-codestarconnections';
import * as build from 'aws-cdk-lib/aws-codebuild';
import * as actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const env = this.node.getContext('env');
    const project = this.node.getContext('project');
    const repo = this.node.getContext('repo');

    const bucket = new s3.Bucket(this, 'PipelineArtifact', {
      bucketName: `${env}-${project}-pipeline-artifact`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: true,
        ignorePublicAcls: true,
        blockPublicPolicy: true,
        restrictPublicBuckets: true,
      })
    });

    const bucketPolicy = new iam.PolicyStatement({
      effect: iam.Effect.DENY,
      actions: ['s3:*'],
      principals: [new iam.StarPrincipal()],
      resources: [
        bucket.bucketArn + '/*'
      ],
      conditions: {
        'Bool': {
          'aws:SecureTransport': false
        }
      }
    });

    bucket.addToResourcePolicy(bucketPolicy);

    const buildLogGroup = new logs.LogGroup(this, 'BuildLogGroup', {
      logGroupName: `/aws/codebuild/${env}-${project}-build`,
      retention: logs.RetentionDays.THREE_MONTHS
    });

    const githubConnection = new codestar.CfnConnection(this, 'CodeStarConnection', {
      connectionName: `${env}-${project}-github-connection`,
      providerType: 'GitHub'
    });

    const buildProject = new build.PipelineProject(this, 'BuildProject', {
      projectName: `${env}-${project}-build`,
      logging: {
        cloudWatch: {
          logGroup: buildLogGroup,
          enabled: true
        }
      },
      environment: {
        computeType: build.ComputeType.SMALL,
        buildImage: build.LinuxBuildImage.STANDARD_4_0,
        privileged: false,
        environmentVariables: {
          ENV: { value: env },
          BUILD_ARTIFACT_BUCKET: { value: bucket.bucketName }
        }
      },
      cache: build.Cache.bucket(bucket)
    });

    const sourceArtifact = new codepipeline.Artifact('SourceArtifact');
    const buildArtifact = new codepipeline.Artifact('BuildArtifact');

    const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
      pipelineName: `${env}-${project}-pipeline`,
      artifactBucket: bucket,
    });

    const sourceAction = new actions.CodeStarConnectionsSourceAction({
      actionName: 'Source',
      output: sourceArtifact,
      connectionArn: githubConnection.attrConnectionArn,
      owner: repo.owner,
      repo: repo.repo,
      branch: repo.branch,
      runOrder: 1,
    });

    const buildAction = new actions.CodeBuildAction({
      actionName: 'Build',
      input: sourceArtifact,
      outputs: [buildArtifact],
      project: buildProject,
      runOrder: 1,
    });

    const deployActionForCreateChangeSet = new actions.CloudFormationCreateReplaceChangeSetAction({
      actionName: 'CreateChangeSet',
      stackName: `${env}-${project}-stack`,
      changeSetName: `${env}-${project}-stack-changeset`,
      templatePath: buildArtifact.atPath('packaged.yaml'),
      adminPermissions: true,
      parameterOverrides: {
        'ENV': env,
      },
      runOrder: 1
    });

    const deployActionForExecuteChangeSet = new actions.CloudFormationExecuteChangeSetAction({
      actionName: 'ExecuteChangeSet',
      stackName: `${env}-${project}-stack`,
      changeSetName: `${env}-${project}-stack-changeset`,
      runOrder: 2,
    })

    pipeline.addStage({
      stageName: 'Source',
      actions: [sourceAction]
    });

    pipeline.addStage({
      stageName: 'Build',
      actions: [buildAction]
    });

    pipeline.addStage({
      stageName: 'Deploy',
      actions: [deployActionForCreateChangeSet, deployActionForExecuteChangeSet]
    })
  }
}
