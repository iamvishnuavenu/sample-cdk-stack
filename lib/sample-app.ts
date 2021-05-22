import { Construct, Tags, Duration } from "@aws-cdk/core";
import * as autoscaling from '@aws-cdk/aws-autoscaling';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import { SubnetSelection } from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as route53 from '@aws-cdk/aws-route53';
import * as route53targets from '@aws-cdk/aws-route53-targets';


function composeResourceName(dgn: string, part: string):string{
  return `${dgn}-${part}`
}

function generateRandomId(){
  return Math.random().toString(36).slice(2);
}

function injectTags(tags: any, resource: Construct ){
  for ( let key in tags ){
      let value = tags[key];
      Tags.of(resource).add(key, value)
  }
}

export interface SampleAppProps {
  dgn?:string,
  instanceType?:string; // micro, medium, large
  ami?:string; 
  vpcId?:string;
  vpcSubnets?:[string],
  minCapacity?: number,
  maxCapacity?: number,
  subnetForASG?: {},
  ec2Tags: {},
  subnetForALB: {},
  isPublicALB: boolean,
  securityGroups:{id:string, port: number, description: string}[],
  albCertArn: string,
  hostZoneId: string,
  zoneName: string,
  recordName: string
}


export class SampleApp extends Construct {
  private readonly asg: autoscaling.AutoScalingGroup; 
  private readonly vpc: ec2.IVpc;
  public readonly alb: elbv2.ApplicationLoadBalancer;
  private readonly albSecurityGroup: ec2.SecurityGroup;
  private readonly listener: elbv2.IApplicationListener;
  private readonly asgSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: SampleAppProps){
      super(scope, id);

      var giveId = composeResourceName.bind(null, props.dgn||"dev");
 
      // Importing VPC
      this.vpc = ec2.Vpc.fromLookup(this, "existingVPC", { vpcId: props.vpcId})
      const cert = acm.Certificate.fromCertificateArn(this, 'certficate',props.albCertArn)
 

      // Creating Security Groups for ASG and ALB

      this.albSecurityGroup = new ec2.SecurityGroup(this, giveId(`${id}-alb-sg`), 
                              {vpc: this.vpc,
                               description: `Security Group for ${id}`});
      this.albSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Access Server');


      this.asgSecurityGroup = new ec2.SecurityGroup(this, giveId(`${id}-asg-sg`), { 
                                  vpc: this.vpc,
                                  description: `Security Group for ${giveId(id)}` });
                                    
      this.asgSecurityGroup.addIngressRule(this.albSecurityGroup, ec2.Port.tcp(8999), "Access From LoadBalancer");

      props.securityGroups.forEach(rule => {
          let sg = ec2.SecurityGroup.fromSecurityGroupId(this, generateRandomId(), rule.id, {
              mutable: false
           });
          this.asgSecurityGroup.addIngressRule(sg, ec2.Port.tcp(rule.port), rule.description)
      })

      // Setting Up ALB 
      this.alb = new elbv2.ApplicationLoadBalancer(this, 
              giveId(`${id}-alb`), {
                   vpc: this.vpc,
                   internetFacing: props.isPublicALB || false,
                   securityGroup: this.albSecurityGroup,
                   loadBalancerName: giveId(`${id}-alb`),
                   vpcSubnets: this.getSelectedSubnets(props.subnetForALB)
              });
      
      Tags.of(this.alb).add("Name", giveId(`${id}-alb`));
      
      this.listener = this.alb.addListener(giveId(`${id}-listener`), {
         port: 443,
         open: true,
         protocol: elbv2.ApplicationProtocol.HTTPS,
         certificates: [cert]
      });
     
      // Setting up ASG
      const asgSubnets: SubnetSelection = this.getSelectedSubnets(props.subnetForASG);

      this.asg = new autoscaling.AutoScalingGroup(this, giveId(`${id}-asg`), {
          vpc: this.vpc,
          maxCapacity: props.maxCapacity,
          minCapacity: props.minCapacity,
          instanceType: this.getInstanceType( props.instanceType|| "micro"),
          machineImage: this.getMachineImage(props.ami || "" ),
          keyName: this.getSSHKeyPair(props.dgn|| "dev"),
          securityGroup: this.asgSecurityGroup,
          vpcSubnets: asgSubnets,
          autoScalingGroupName: giveId(`${id}-asg`),
          role: this.getRole(props.dgn || "dev")
      });

      injectTags(props.ec2Tags, this.asg)

      this.listener.addTargets('Target', {
          port:8999,
          targets: [this.asg],
          protocol: elbv2.ApplicationProtocol.HTTP,
          healthCheck: {
              path:'/health',
              interval: Duration.minutes(1),
          }
      })
      
    this.listener.connections.allowFrom(this.alb, ec2.Port.tcp(80))

    // Setting up Route53 entry
    const zone = route53.HostedZone.fromHostedZoneAttributes(this, 'existedHostedZone', {
        hostedZoneId: props.hostZoneId,
        zoneName: props.zoneName
     })

    new route53.AaaaRecord(this, 'AliasRecord', {
        zone: zone,
        recordName: props.recordName,
        target: route53.RecordTarget.fromAlias(new route53targets.LoadBalancerTarget(this.alb))
    })
    }

  // Enum should be used to avoid mistype of :type argument, which will always result in "micro" instance
  getInstanceType(type: string){
      switch(type){
          case "micro":
              return ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO);
          case "medium":
              return ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MEDIUM);
          case "large":
              return ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.LARGE);
          default:
              return ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO);
      }
  }

  getMachineImage(amiName: string){
      return new ec2.LookupMachineImage({ name: amiName});
  }


  getSelectedSubnets(listOfSubnets: any ):SubnetSelection {
      const asgSubnets: SubnetSelection = { subnets: []}
      for ( let key in listOfSubnets ){
            let value = listOfSubnets[key];
            let subnet = ec2.Subnet.fromSubnetAttributes(this,`'subnetid-'${generateRandomId()}`, { subnetId:key, availabilityZone: value});
            asgSubnets.subnets?.push(subnet)
      }
      return asgSubnets
  }

  getRole(env: string){
      switch(env){
          case "dev":
              return iam.Role.fromRoleArn(this, 'sample-app-role',"arn:aws:iam::<ACC_ID>:role/<DEV_ROLE_NAME>" )
          case "prod":
              return iam.Role.fromRoleArn(this, 'sample-app-role',"arn:aws:iam::<ACC_ID>:role/<PROD_ROLE_NAME>" )
          default:
              return iam.Role.fromRoleArn(this, 'sample-app-role',"arn:aws:iam::<ACC_ID>:role/<DEV_ROLE_NAME>" )
      }
  }

  getSSHKeyPair(env: string){
      switch(env){
          case "dev":
              return "ssh-dev"
          case "stag":
              return "ssh-stag"
          case "prod":
              return "ssh-prod"
          default:
              return "ssh-dev"
      }
  }
}


