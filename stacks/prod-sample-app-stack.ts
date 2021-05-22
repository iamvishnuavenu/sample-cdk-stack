import * as cdk from '@aws-cdk/core';
import { SampleAppProps, SampleApp } from '../lib/sample-app';

export class ProdSampleAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
  
    var envProps:SampleAppProps = {
        dgn:'prod', 
        instanceType: 'medium', 
        ami: "<AMI NAME>",
        vpcId: "vpc-<SOMETHING>",
        minCapacity: 2,
        maxCapacity: 2,
        ec2Tags: {
          'TYPE': "application",
          'DEPLOYMENT_GROUP_NAME': "production"
        },
        subnetForASG: {
          "subnet-<id1>" : 'ap-south-1a',
          "subnet-<id2>" : 'ap-south-1b'
        },
        subnetForALB: {
          "subnet-<id1>": 'ap-south-1b',
          "subnet-<id2>": 'ap-south-1a'
        },
        isPublicALB: true,
        securityGroups:[
          {id: '<ADD HERE OTHER SECURITY ID>', port: 9100,description: 'Node Exporter' }, // Keeping it empty its also works
        ],
        albCertArn: 'arn:aws:acm:ap-south-1:<ACC_ID>:certificate/<CERT_ID>',
        zoneName: 'example.com',
        hostZoneId: '<host id>',
        recordName: 'app' // app.example.com

    }

    // Initialization of SampleApp construct
    new SampleApp(this, "SampleApp", envProps); // need to fill the props
  }
}
