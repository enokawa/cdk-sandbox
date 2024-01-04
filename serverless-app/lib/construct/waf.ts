import { aws_wafv2 as waf } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface WafProps {
  scope: string;
  ipAddresses: string[];
  defaultAction: waf.CfnWebACL.DefaultActionProperty;
}

export class Waf extends Construct {
  public readonly webAcl: waf.CfnWebACL;
  constructor(scope: Construct, id: string, props: WafProps) {
    super(scope, id);

    const ipSet = new waf.CfnIPSet(this, 'IPSet', {
      name: 'allow-list',
      ipAddressVersion: 'IPV4',
      scope: props.scope,
      addresses: props.ipAddresses,
    });

    const webAcl = new waf.CfnWebACL(this, 'WebACL', {
      name: 'web-acl',
      defaultAction: props.defaultAction,
      scope: props.scope,
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: 'web-acl',
        sampledRequestsEnabled: true,
      },
      rules: [
        {
          name: 'Custom-AllowFromSpecificIPAddresses',
          priority: 0,
          action: {
            allow: {},
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'Custom-AllowFromSpecificIPAddresses',
            sampledRequestsEnabled: true,
          },
          statement: {
            ipSetReferenceStatement: {
              arn: ipSet.attrArn,
            },
          },
        },
      ],
    });

    this.webAcl = webAcl;
  }
}
