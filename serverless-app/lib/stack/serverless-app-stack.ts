import { Stack, StackProps } from 'aws-cdk-lib';
import { Datastore } from '../construct/datastore';
import { Waf } from '../construct/waf';
import { ApiFunction } from '../construct/lambda';

import { Construct } from 'constructs';

export class ServerlessAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const table = new Datastore(this, 'Datastore');

    new Waf(this, 'Waf', {
      scope: 'REGIONAL',
      ipAddresses: ['1.1.1.1/32'], // Enter your IP
      defaultAction: { block: {} }
    });

    new ApiFunction(this, 'ApiFunction', {
      table: table.table,
    });
  }
}
