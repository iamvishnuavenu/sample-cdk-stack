import * as cdk from '@aws-cdk/core';
import { SampleAppProps, SampleAppStack } from '../lib/sample-app';

export class DevSampleAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
  
    var serviceProps:SampleAppProps = {
        org:'sc', 
        dgn:'beta', 
        instanceType: 'micro', 
        ami: "<AMI NAME>",
        vpcId: "vpc-<SOMETHING>",
        minCapacity: 2,
        maxCapacity: 2,
        ec2Tags: {
          'TYPE': "application",
          'DEPLOYMENT_GROUP_NAME': "production"
        },
        subnetForASG: {
          "subnet-afdb45c7" : 'ap-south-1a',
          "subnet-2a7ab566" : 'ap-south-1b'
        },
        subnetForALB: {
          "subnet-89f837c5": 'ap-south-1b',
          "subnet-95d846fd": 'ap-south-1a'
        },
        isPublicALB: true,
        securityGroups:[
          {id: '<ADD HERE OTHER SECURITY ID>', port: 9100,description: 'Node Exporter' }, // Keeping it empty its also works
        ],
        albCertArn: 'arn:aws:acm:ap-south-1:<ACC_ID>:certificate/<CERT_ID>',
  
    }

    // The code that defines your stack goes here
    new SampleAppStack(this, "SampleApp", serviceProps); // need to fill the props
  }
}
