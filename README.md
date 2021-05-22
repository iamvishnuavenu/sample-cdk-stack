# Sample app stack

A Sample code to deploy multi-resource stack on AWS using AWS CDK.
This tutorial is the follow up material of my blog on AWS CDK. The code is not complete and nowhere near ready for the production.
The main intent of this tutorial is get started with AWS CDK, which in my opinion is really nice tool have in our DevOps Toolkit.


## Good Article to setup Profile:
https://docs.aws.amazon.com/sdk-for-php/v3/developer-guide/guide_credentials_profiles.html


## Setting up the AWS CDK on local system
https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html


## Command 
```
# build the application
$ npm run build

# checking out the rendered Cloudformation template
$ cdk synth <> --profile <>

# Deploying on specific Environment
$ cdk deploy <stack-name>  --profile <>


# eg.
# Development

$ cdk deploy DevSampleAppStack --profile dev-environment

# Production

$ cdk deploy ProdSampleAppStack --profile prod-environment

```




The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Other Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template



