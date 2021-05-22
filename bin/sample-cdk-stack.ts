#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';

import { DevSampleAppStack } from '../stacks/dev-sample-app-stack';
import { ProdSampleAppStack } from '../stacks/prod-sample-app-stack';

const process = require('process');
const app = new cdk.App();


new DevSampleAppStack(app, 'DevSampleAppStack', { env: {
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION  
}});


new ProdSampleAppStack(app, 'ProdSampleAppStack', { env: {
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION  
}});