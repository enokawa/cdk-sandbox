import { Stack, StackProps } from 'aws-cdk-lib';
import { Datastore } from '../construct/datastore';

import { Construct } from 'constructs';

export class ServerlessAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new Datastore(this, 'Datastore');
  }
}
