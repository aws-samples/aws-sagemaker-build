var fs=require('fs')
var Promise=require('bluebird')
var _=require('lodash')

module.exports=Object.assign(require('./setup'),{
    "SageMakerNotebookInstance":{
        "Type": "Custom::SageMakerNotebookInstance",
        Condition:"InternalNoteBookInstance",
        "DependsOn":["CFNLambdaPolicy"],
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["SageMakerNotebookInstanceLambda", "Arn"] },
            InstanceType:"ml.t2.medium",
            NotebookInstanceName:{"Fn::GetAtt":["Notebook","Name"]},
            RoleArn:{"Fn::GetAtt":["InternalNotebookRole","Arn"]}
        }
    },
    "InternalNotebookRole":{
      "Type": "AWS::IAM::Role",
      Condition:"InternalNoteBookInstance",
      "Properties":{
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
            "Path": "/"
          }
    },
    "ExternalNotebookRole":{
        "Type": "Custom::Variables",
        Condition:"ExternalNoteBookInstance",
        "Properties": {
            "ServiceToken": {"Fn::GetAtt" : ["SageMakerNotebookRoleLambda", "Arn"]},
            "NotebookInstanceName":{"Fn::GetAtt":["Notebook","Name"]}
        }
    },
    "NotebookPolicy":{
      "Type": "AWS::IAM::ManagedPolicy",
      Condition:"NoteBookInstance",
      "Properties": {
        Roles:[{"Fn::If":[
            "InternalNoteBookInstance",
            {"Ref":"InternalNotebookRole"},
            {"Ref":"ExternalNotebookRole"}
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
                "arn:aws:sagemaker::${AWS::AccountId}:endpoint/${Variables.EndpointName}"}]
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
