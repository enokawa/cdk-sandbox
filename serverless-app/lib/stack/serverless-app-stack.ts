import { Stack, StackProps } from 'aws-cdk-lib';
import { Datastore } from '../construct/datastore';
import { Waf } from '../construct/waf';
import { ApiFunction } from '../construct/lambda';
import { Api } from '../construct/api';
import { Construct } from 'constructs';
import { WafAssociate } from '../construct/waf-associate';

export class ServerlessAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const datastore = new Datastore(this, 'Datastore');

    const waf = new Waf(this, 'Waf', {
      scope: 'REGIONAL',
      ipAddresses: ['1.1.1.1/32'], // Enter your IP
      defaultAction: { block: {} }
    });

    const apiFunction = new ApiFunction(this, 'ApiFunction', {
      table: datastore.table,
    });

    const api = new Api(this, 'Api', {
      lambda: apiFunction.apiFunction,
      stageName: 'dev',
    });

    new WafAssociate(this, 'WafAssociate', {
      resourceArn: `arn:aws:apigateway:ap-northeast-1::/restapis/${api.restApi.restApiId}/stages/dev`,
      webAclArn: waf.webAcl.attrArn,
    });
  }
}
