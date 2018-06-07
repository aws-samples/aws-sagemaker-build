var fs=require('fs')
var Promise=require('bluebird')
var _=require('lodash')

module.exports={
    "SageMakerNotebookInstance":{
        "Type": "AWS::SageMaker::NotebookInstance",
        Condition:"InternalNoteBookInstance",
        "Properties": {
            InstanceType:"ml.t2.medium",
            NotebookInstanceName:{"Fn::GetAtt":["Notebook","Name"]},
            RoleArn:{"Fn::GetAtt":["InternalNotebookRole","Arn"]},
            LifecycleConfigName:{"Fn::GetAtt":["SageMakerNotebookLifecycle","NotebookInstanceLifecycleConfigName"]}
        }
    },
    "SageMakerNotebookLifecycle":{
        "Type" : "AWS::SageMaker::NotebookInstanceLifecycleConfig",
        "Properties" : {
            OnCreate:[{
                Content:{"Fn::Base64":{"Fn::Sub":fs.readFileSync(`${__dirname}/scripts/OnCreate.sh`,"utf-8")}}
            }]
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
            "Path": "/",
            "ManagedPolicyArns":[
                {"Ref":"NotebookPolicy"},
                "arn:aws:iam::aws:policy/AdministratorAccess"
            ]
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
            {"Ref":"AWS::NoValue"},
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
              "Action": ["cloudformation:DescribeStacks",
                "cloudformation:UpdateStack"],
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
                {"Fn::Sub":"arn:aws:s3:::${Variables.DataBucket}/*"},
                {"Fn::Sub":"arn:aws:s3:::${Variables.DataBucket}"},
                {"Fn::Sub":"arn:aws:s3:::${AssetBucket}/*"},
                {"Fn::Sub":"arn:aws:s3:::${CodeBucket}/*"}
              ]
          },{
              "Effect": "Deny",
              "Action": ["s3:DeleteBucket*"],
              "Resource":[{"Fn::Sub":"arn:aws:s3:::${Variables.DataBucket}"}]
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
          },{
              "Effect": "Allow",
              "Action": ["logs:*"],
              "Resource":["*"]
          }]
        }
      }
    }
}
