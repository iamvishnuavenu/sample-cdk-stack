#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';

import { DevSampleAppStack } from '../stacks/dev-sample-app-stack';

const process = require('process');

const app = new cdk.App();


new DevSampleAppStack(app, 'SampleAppStack', { env: {
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION  
}});
