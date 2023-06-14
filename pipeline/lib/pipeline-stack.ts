import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'PipelineArtifact', {
      bucketName: 'dev-enokawa-pipeline-artifact',
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
      roleName: 'dev-enokawa-pipeline-role',
      description: 'dev-enokawa-pipeline-role',
      assumedBy: new iam.ServicePrincipal('codepipeline.amazonaws.com')
    });

    // TODO: Set with minimum privileges
    pipelineRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'))

    const buildRole = new iam.Role(this, 'BuildRole', {
      roleName: 'dev-enokawa-build-role',
      description: 'dev-enokawa-build-role',
      assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com')
    });

    // TODO: Set with minimum privileges
    buildRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'))

    const deployRole = new iam.Role(this, 'deployRole', {
      roleName: 'dev-enokawa-deploy-role',
      description: 'dev-enokawa-deploy-role',
      assumedBy: new iam.ServicePrincipal('cloudformation.amazonaws.com')
    });

    // TODO: Set with minimum privileges
    deployRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'))
  }
}
