import * as cdk from '@aws-cdk/core';
import { SampleAppProps, SampleApp } from '../lib/sample-app';

export class DevSampleAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
  
    var envProps:SampleAppProps = {
        dgn: 'dev',
        instanceType: 'micro', 
        ami: "<AMI NAME>",
        vpcId: "vpc-<SOMETHING>",
        minCapacity: 1,
        maxCapacity: 1,
        ec2Tags: {
          'TYPE': "application",
          'DEPLOYMENT_GROUP_NAME': "development"
        },
        subnetForASG: {
          "subnet-<id1>" : 'ap-south-1a',
          "subnet-<id2>" : 'ap-south-1b'
        },
        subnetForALB: {  // should be public subnet for public ALB
          "subnet-<id1>": 'ap-south-1b',
          "subnet-<id3>": 'ap-south-1a'
        },
        isPublicALB: true,
        securityGroups:[
          {id: '<ADD HERE OTHER SECURITY ID>', port: 9100,description: 'Node Exporter' }, // Keeping it empty its also works
        ],
        albCertArn: 'arn:aws:acm:ap-south-1:<ACC_ID>:certificate/<CERT_ID>',
        zoneName: 'dev.example.com',
        hostZoneId: '<zone-id>',
        recordName: 'app' // app.dev.example.com
    }

    // Initialization of SampleApp construct
    new SampleApp(this, "SampleApp", envProps); // need to fill the props
  }
}
