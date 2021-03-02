#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { SampleCdkStackStack } from '../lib/sample-cdk-stack-stack';

const app = new cdk.App();
new SampleCdkStackStack(app, 'SampleCdkStackStack');
