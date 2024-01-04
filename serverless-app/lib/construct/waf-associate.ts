import { aws_wafv2 as waf, aws_apigateway as apigateway, CfnResource } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface WafAssociateProps {
  restApi: apigateway.RestApi;
  webAcl: waf.CfnWebACL;
}

export class WafAssociate extends Construct {
  constructor(scope: Construct, id: string, props: WafAssociateProps) {
    super(scope, id);

    const restApiArn = `arn:aws:apigateway:ap-northeast-1::/restapis/${props.restApi.restApiId}/stages/dev`;
    const webAclAssociation = new waf.CfnWebACLAssociation(this, 'WebAclAssociation', {
      resourceArn: restApiArn,
      webAclArn: props.webAcl.attrArn,
    });

    webAclAssociation.addDependency(props.webAcl);
    webAclAssociation.addDependency(props.restApi.deploymentStage.node.defaultChild as CfnResource);
  }
}
