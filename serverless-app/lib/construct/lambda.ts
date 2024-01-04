import {
  aws_dynamodb as dynamodb,
  aws_iam as iam,
  aws_lambda as lambda,
  Duration
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface ApiFunctionProps {
  table: dynamodb.ITable;
}

export class ApiFunction extends Construct {
  public readonly apiFunction: lambda.Function;

  constructor(scope: Construct, id: string, props: ApiFunctionProps) {
    super(scope, id);

    const apiFunction = new lambda.DockerImageFunction(this, 'ApiFunction', {
      code: lambda.DockerImageCode.fromImageAsset('src'),
      memorySize: 256,
      timeout: Duration.seconds(10),
      environment: {
        MOVIE_TABLE: props.table.tableName,
      },
    });

    apiFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['dynamodb:Query', 'dynamodb:GetItem', 'dynamodb:PutItem', 'dynamodb:UpdateItem', 'dynamodb:DeleteItem'],
        resources: [props.table.tableArn],
      }),
    );

    this.apiFunction = apiFunction;
  }
}