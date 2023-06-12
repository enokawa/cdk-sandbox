import cdk = require('@aws-cdk/core');
import lambda = require('@aws-cdk/aws-lambda');

export interface HitCounterProps {
  downstream: lambda.IFunction;
}

export class HitCounter extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: HitCounterProps) {
    super(scope, id);

    // TODO
  }
}
