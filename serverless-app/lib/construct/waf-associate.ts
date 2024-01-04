// import * as cdk from 'aws-cdk-lib';
import { aws_wafv2 as waf} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface WafAssociateProps {
  resourceArn: string;
  webAclArn: string;
}

export class WafAssociate extends Construct {
  constructor(scope: Construct, id: string, props: WafAssociateProps) {
    super(scope, id);

    // const restApiArn = `arn:aws:apigateway:${props.env?.region}::/restapis/${props.restApi.restApiId}/stages/${props.envName}`;
    new waf.CfnWebACLAssociation(this, 'WebAclAssociation', {
      resourceArn: props.resourceArn,
      webAclArn: props.webAclArn
    });

    // webAclAssociation.addDependency(props.webAcl);
    // webAclAssociation.addDependency(props.restApi.deploymentStage.node.defaultChild as cdk.CfnResource);
  }
}
