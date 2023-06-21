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

    const pipelineRole = new iam.Role(this, 'PipelineRole', {
      roleName: `${env}-${project}-pipeline-role`,
      description: `${env}-${project}-pipeline-role`,
      assumedBy: new iam.ServicePrincipal('codepipeline.amazonaws.com')
    });

    const buildRole = new iam.Role(this, 'BuildRole', {
      roleName: `${env}-${project}-build-role`,
      description: `${env}-${project}-build-role`,
      assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com')
    });

    const deployRole = new iam.Role(this, 'deployRole', {
      roleName: `${env}-${project}-deploy-role`,
      description: `${env}-${project}-deploy-role`,
      assumedBy: new iam.ServicePrincipal('cloudformation.amazonaws.com')
    });

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
      role: buildRole,
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
      role: pipelineRole,
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
      deploymentRole: deployRole,
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
