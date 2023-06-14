import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Pipeline from '../lib/pipeline-stack';

test('S3 Bucket Created', () => {
  const app = new cdk.App();
  const stack = new Pipeline.PipelineStack(app, 'MyTestStack');
  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::S3::Bucket', {
    BucketName: 'dev-enokawa-pipeline-artifact',
    BucketEncryption: {
      ServerSideEncryptionConfiguration :[{
        ServerSideEncryptionByDefault: {
            SSEAlgorithm: 'AES256'
        }
      }]
    },
    VersioningConfiguration: { Status: 'Enabled' },
    PublicAccessBlockConfiguration: {
      BlockPublicAcls: true,
      BlockPublicPolicy: true,
      IgnorePublicAcls: true,
      RestrictPublicBuckets: true
    }
  });
});
