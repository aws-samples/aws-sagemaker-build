var fs=require('fs')
var Promise=require('bluebird')
var _=require('lodash')

module.exports=Object.assign(require('./setup'),{
    "SageMakerNotebookInstance":{
        "Type": "Custom::SageMakerNotebookInstance",
        Condition:"LaunchNoteBookInstance",
        "DependsOn":["CFNLambdaPolicy"],
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["SageMakerNotebookInstanceLambda", "Arn"] },
            InstanceType:"ml.t2.medium",
            NotebookInstanceName:{"Ref":"AWS::StackName"},
            RoleArn:{"Fn::GetAtt":["NotebookRole","Arn"]}
        }
    },
    "NotebookRole":{
      "Type": "AWS::IAM::Role",
      Condition:"LaunchNoteBookInstance",
      "Properties": {
        "AssumeRolePolicyDocument": {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Principal": {
                "Service": "sagemaker.amazonaws.com"
              },
              "Action": "sts:AssumeRole"
            }
          ]
        },
        "Path": "/",
        "ManagedPolicyArns": [{"Ref":"NotebookPolicy"}]
      }
    },
    "NotebookPolicy":{
      "Type": "AWS::IAM::ManagedPolicy",
      "Properties": {
        Roles:[{"Fn::If":[
            "AttachAccessPolicy",
            {"Ref":"AccessRoleArn"},
            {"Ref":"AWS::NoValue"}
        ]}],
        "PolicyDocument": {
          "Version": "2012-10-17",
          "Statement": [{
              "Effect": "Allow",
              "Action": ["sns:Publish"],
              "Resource":[{"Ref":"LaunchTopic"}]
          },{
              "Effect": "Allow",
              "Action": ["cloudformation:DescribeStacks"],
              "Resource":[{"Fn::Sub":
                "arn:aws:cloudformation:${AWS::Region}:${AWS::AccountId}:stack/${AWS::StackName}/*"
              }]
          },{
              "Effect": "Allow",
              "Action": [
                "states:Describe*",
                "states:List*"],
              "Resource":["*"]
          },{
              "Effect": "Allow",
              "Action": ["codecommit:*"],
              "Resource":[{"Fn::GetAtt":["CodeRepo","Arn"]}]
          },{
              "Effect": "Allow",
              "Action": ["sagemaker:InvokeEndpoint"],
              "Resource":[{"Fn::Sub":
                "arn:aws:sagemaker:${AWS::Region}:${AWS::AccountId}:endpoint/${Variables.EndpointName}"}]
          },{
              "Effect": "Allow",
              "Action": ["lambda:UpdateFunctionCode"],
              "Resource":[
                {"Fn::GetAtt":["StepLambdaGetTrainingDockerfilePath","Arn"]},
                {"Fn::GetAtt":["StepLambdaGetInferenceDockerfilePath","Arn"]},
                {"Fn::GetAtt":["StepLambdaGetTrainingConfig","Arn"]},
                {"Fn::GetAtt":["StepLambdaGetEndpointConfig","Arn"]}
              ]
          },{
              "Effect": "Allow",
              "Action": ["s3:*"],
              "Resource":[
                {"Fn::Sub":"arn:aws:s3:::${DataBucket}/*"},
                {"Fn::Sub":"arn:aws:s3:::${DataBucket}"}
              ]
          },{
              "Effect": "Deny",
              "Action": ["s3:DeleteBucket*"],
              "Resource":[{"Fn::Sub":"arn:aws:s3:::${DataBucket}"}]
          },{
              "Effect": "Allow",
              "Action": ["sns:Subscribe",
                "sns:Unsubscribe",
                "sns:ListSubscriptions",
                "sns:ConfirmSubscription"
            ],
              "Resource":[{"Ref":"TrainStatusTopic"}]
          },{
              "Effect": "Allow",
              "Action": ["sns:Publish"],
              "Resource":[{"Ref":"LaunchTopic"}]
          }]
        }
      }
    }
})
