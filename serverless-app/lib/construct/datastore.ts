import { aws_dynamodb as dynamodb, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class Datastore extends Construct {
  public readonly movieTable: dynamodb.Table;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const movieTable = new dynamodb.Table(this, 'MovieTable', {
      tableName: 'movie',
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: 'title', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'content', type: dynamodb.AttributeType.STRING },
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    this.movieTable = movieTable;
  }
}
