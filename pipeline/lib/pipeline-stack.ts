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

    pipelineRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'))
  }
}
