import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';
import { DockerImageAsset, Platform } from 'aws-cdk-lib/aws-ecr-assets';
import path = require('path');

export class LocustStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'Vpc', {
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      restrictDefaultSecurityGroup: false
    });

    const asset = new DockerImageAsset(this, 'MyBuildImage', {
      directory: path.join(__dirname, '../locust'),
      platform: Platform.LINUX_ARM64
    });

    // TODO: Create ECS
  }
}
