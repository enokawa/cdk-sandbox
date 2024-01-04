import { Stack, StackProps } from 'aws-cdk-lib';
import { Datastore } from '../construct/datastore';
import { Waf } from '../construct/waf';
import { Lambda } from '../construct/lambda';
import { Api } from '../construct/api';
import { Construct } from 'constructs';
import { WafAssociate } from '../construct/waf-associate';

export class ServerlessAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const datastore = new Datastore(this, 'Datastore');

    const waf = new Waf(this, 'Waf', {
      ipAddresses: ['1.1.1.1/32'], // Enter your IP
      defaultAction: { block: {} }
    });

    const lambda = new Lambda(this, 'ApiFunction', {
      table: datastore.movieTable,
    });

    const api = new Api(this, 'Api', {
      lambda: lambda.apiFunction,
      stageName: 'dev',
    });

    new WafAssociate(this, 'WafAssociate', {
      restApi: api.movieApi,
      webAcl: waf.movieAcl,
    });
  }
}
