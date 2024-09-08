import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ec2 as ec2, aws_ecs as ecs, aws_ecs_patterns as ecsp } from 'aws-cdk-lib';
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

    const cluster = new ecs.Cluster(this, 'ECSCluster', {
      vpc,
      clusterName: 'locust'
    });

    const loadBalancedFargateService = new ecsp.ApplicationLoadBalancedFargateService(this, 'Master', {
      cluster,
      serviceName: 'master',
      loadBalancerName: 'locust',
      memoryLimitMiB: 512,
      cpu: 256,
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.ARM64
      },
      taskImageOptions: {
        image: ecs.ContainerImage.fromDockerImageAsset(asset),
        family: 'master',
        containerName: 'master',
        containerPort: 8089,
        enableLogging: true,
        environment: {
          TEST_ENVIRONMENT_VARIABLE1: 'test environment variable 1 value',
        },
        command: ['--master']
      },
      desiredCount: 1,
    });

    // TODO: Add Worker service
  }
}
