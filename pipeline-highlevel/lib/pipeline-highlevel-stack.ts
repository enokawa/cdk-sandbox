import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codestar from 'aws-cdk-lib/aws-codestarconnections';
import * as pipelines from 'aws-cdk-lib/pipelines';

export class PipelineHighlevelStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const githubConnection = new codestar.CfnConnection(this, 'CodeStarConnection', {
      connectionName: `github-connection`,
      providerType: 'GitHub'
    });

    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.connection('enokawa/cdk-sadbox', 'main', {
          connectionArn: githubConnection.attrConnectionArn
        }),
        commands: ['npm ci']
      })
    });
  }
}
