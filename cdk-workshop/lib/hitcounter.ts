import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as dynamodb from '@aws-cdk/aws-dynamodb'
import * as iam from '@aws-cdk/aws-iam';

export interface HitCounterProps {
  downstream: lambda.IFunction;
}

export class HitCounter extends cdk.Construct {
  public readonly handler: lambda.Function;
  public readonly table: dynamodb.Table;

  constructor(scope: cdk.Construct, id: string, props: HitCounterProps) {
    super(scope, id);

    const table = new dynamodb.Table(this, 'Hits', {
      partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING }
    });

    this.handler = new lambda.Function(this, 'HitCounterHandler', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'hitcounter.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
        HITS_TABLE_NAME: table.tableName
      }
    });
    this.table = table;

    const updateItemStatement: iam.PolicyStatement = new iam.PolicyStatement ({
      actions: ['dynamodb:UpdateItem'],
      effect: iam.Effect.ALLOW,
      resources: [
        table.tableArn,
      ]
    });

    const invokeFuncitionStatement: iam.PolicyStatement = new iam.PolicyStatement ({
      actions: ['lambda:*'],
      effect: iam.Effect.ALLOW,
      resources: [
        props.downstream.functionArn,
      ]
    });

    this.handler.addToRolePolicy(updateItemStatement);
    this.handler.addToRolePolicy(invokeFuncitionStatement);
  }
}
