#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ServerlessAppStack } from '../lib/stack/serverless-app-stack';

const app = new cdk.App();
new ServerlessAppStack(app, 'ServerlessAppStack');
