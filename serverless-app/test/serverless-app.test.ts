import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as ServerlessApp from '../lib/stack/serverless-app-stack';

test('DynamoDB Created', () => {
  const app = new cdk.App();
  const stack = new ServerlessApp.ServerlessAppStack(app, 'MyTestStack');

  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::DynamoDB::Table', {
    BillingMode: 'PAY_PER_REQUEST',
  });
});
