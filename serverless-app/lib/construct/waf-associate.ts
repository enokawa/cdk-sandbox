import { aws_wafv2 as waf} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface WafAssociateProps {
  resourceArn: string;
  webAclArn: string;
}

export class WafAssociate extends Construct {
  constructor(scope: Construct, id: string, props: WafAssociateProps) {
    super(scope, id);

    new waf.CfnWebACLAssociation(this, 'WebAclAssociation', {
      resourceArn: props.resourceArn,
      webAclArn: props.webAclArn
    });
  }
}
