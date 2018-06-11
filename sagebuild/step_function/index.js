var fs=require('fs')
var Promise=require('bluebird')
var _=require('lodash')

module.exports=Object.assign(
    require('./lambdas'),
    require('./stateMachines').StateMachine,
    require('./launch'),{
    "ModelClear":{
        "Type": "Custom::SageMakerModelClear",
        "DependsOn":["CFNLambdaPolicy","EndpointConfigClear"],
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["SageMakerClearModelLambda", "Arn"] },
            "name":{"Fn::Sub":"${AWS::StackName}-"}
        }
    },
    "EndpointConfigClear":{
        "Type": "Custom::SageMakerEndpointConfigClear",
        "DependsOn":["CFNLambdaPolicy","EndpointClear"],
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["SageMakerClearEndpointConfigLambda", "Arn"] },
            "name":{"Fn::Sub":"${AWS::StackName}-"}
        }
    },
    "EndpointClear":{
        "Type": "Custom::SageMakerEndpointClear",
        "DependsOn":["CFNLambdaPolicy"],
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["SageMakerClearEndpointLambda", "Arn"] },
            "name":{"Fn::GetAtt":["Variables","EndpointName"]}
        }
    },
    "TrainStatusTopic":{
        "Type" : "AWS::SNS::Topic",
        "Properties" :{
            DisplayName:{"Fn::Sub":"${AWS::StackName}-train-status"}
        }
    },
    "ArtifactBucket":{
        "Type" : "AWS::S3::Bucket",
        "Properties" : {}
    },
    "ArtifactClear":{
        "Type": "Custom::S3Clear",
        "DependsOn":["CFNLambdaPolicy"],
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["S3ClearLambda", "Arn"] },
            "Bucket":{"Ref":"ArtifactBucket"}
        }
    },
    "DataBucket":{
        "Type" : "AWS::S3::Bucket",
        Condition:"CreateDataBucket",
        "Properties" : {
            Tags:[{
                Key:"sagebuild:channel:train",
                Value:"train/"
            },{
                Key:"sagebuild:channel:test",
                Value:"test/"
            }]
        }
    },
    "DataClear":{
        "Type": "Custom::S3Clear",
        Condition:"CreateDataBucket",
        "DependsOn":["CFNLambdaPolicy"],
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["S3ClearLambda", "Arn"] },
            "Bucket":{"Ref":"DataBucket"}
        }
    },
    "CheckPointBucket":{
        "Type" : "AWS::S3::Bucket",
        "Properties" : {}
    },
    "CheckPointClear":{
        "Type": "Custom::S3Clear",
        "DependsOn":["CFNLambdaPolicy"],
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["S3ClearLambda", "Arn"] },
            "Bucket":{"Ref":"CheckPointBucket"}
        }
    },
    "CodeBucket":{
        "Type" : "AWS::S3::Bucket",
        "Properties" : {}
    },
    "CodeClear":{
        "Type": "Custom::S3Clear",
        "DependsOn":["CFNLambdaPolicy"],
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["S3ClearLambda", "Arn"] },
            "Bucket":{"Ref":"CodeBucket"}
        }
    },
    ModelRole:{
      "Type": "AWS::IAM::Role",
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
        "ManagedPolicyArns":["arn:aws:iam::aws:policy/AmazonSageMakerFullAccess"],
        "Policies":[{
            "PolicyName":"Access",
            "PolicyDocument": {
              "Version": "2012-10-17",
              "Statement": [{
                    "Effect": "Allow",
                    "Action": [
                        "cloudwatch:PutMetricData",
                        "logs:CreateLogStream",
                        "logs:PutLogEvents",
                        "logs:CreateLogGroup",
                        "logs:DescribeLogStreams",
                        "ecr:GetAuthorizationToken"
                    ],
                    "Resource": "*"
                },
                {
                    "Effect": "Allow",
                    "Action": [
                        "s3:GetObject",
                    ],
                    "Resource": [
                        {"Fn::Sub":"arn:aws:s3:::${Variables.DataBucket}/*"},
                        {"Fn::Sub":"arn:aws:s3:::${ArtifactBucket}/*"},
                        {"Fn::Sub":"arn:aws:s3:::${CodeBucket}/*"}
                    ]
                },
                {
                    "Effect": "Allow",
                    "Action": [
                        "ecr:BatchCheckLayerAvailability",
                        "ecr:GetDownloadUrlForLayer",
                        "ecr:BatchGetImage"
                    ],
                    "Resource": [
                        {"Fn::Sub":"arn:aws:ecr:${AWS::Region}:${AWS::AccountId}:repository/${ECRRepo}"},
                    ]
              }]
            }
        }]
      }                
    },
    TrainingRole:{
      "Type": "AWS::IAM::Role",
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
        "Policies":[{
            "PolicyName":"Access",
            "PolicyDocument": {
              "Version": "2012-10-17",
              "Statement": [{
                    "Effect": "Allow",
                    "Action": [
                        "sagemaker:*",
                        "ecr:GetAuthorizationToken",
                        "cloudwatch:PutMetricData",
                        "logs:CreateLogGroup",
                        "logs:CreateLogStream",
                        "logs:DescribeLogStreams",
                        "logs:PutLogEvents",
                        "logs:GetLogEvents"
                    ],
                    "Resource": "*"
                },
                {
                    "Effect": "Allow",
                    "Action": [
                        "iam:PassRole"
                    ],
                    "Resource": "*",
                    "Condition": {
                        "StringEquals": {
                            "iam:PassedToService": "sagemaker.amazonaws.com"
                        }
                    }
                },
                {
                    "Effect": "Allow",
                    "Action": [
                        "s3:ListBucket"
                    ],
                    "Resource": [
                        {"Fn::Sub":"arn:aws:s3:::${Variables.DataBucket}"},
                        {"Fn::Sub":"arn:aws:s3:::${CodeBucket}/*"},
                        {"Fn::Sub":"arn:aws:s3:::${ArtifactBucket}/*"},
                    ]
                },
                {
                    "Effect": "Allow",
                    "Action": [
                        "s3:GetObject",
                        "s3:PutObject",
                        "s3:HeadObject",
                        "s3:DeleteObject"
                    ],
                    "Resource": [
                        {"Fn::Sub":"arn:aws:s3:::${Variables.DataBucket}/*"},
                        {"Fn::Sub":"arn:aws:s3:::${ArtifactBucket}/*"},
                        {"Fn::Sub":"arn:aws:s3:::${CodeBucket}/*"},
                    ]
                },
                {
                    "Effect": "Allow",
                    "Action": [
                        "ecr:BatchCheckLayerAvailability",
                        "ecr:GetDownloadUrlForLayer",
                        "ecr:BatchGetImage"
                    ],
                    "Resource": [
                        {"Fn::Sub":"arn:aws:ecr:${AWS::Region}:${AWS::AccountId}:repository/${ECRRepo}"},
                    ]
              }]
            }
        }]
      }                
    },
    StepFunctionRole:{
      "Type": "AWS::IAM::Role",
      "Properties": {
        "AssumeRolePolicyDocument": {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Principal": {
                "Service": "states.amazonaws.com"
              },
              "Action": "sts:AssumeRole"
            }
          ]
        },
        "Path": "/",
        "Policies":[{
            "PolicyName":"Access",
            "PolicyDocument": {
              "Version": "2012-10-17",
              "Statement": [
                {
                  "Sid": "CloudWatchLogsPolicy",
                  "Effect": "Allow",
                  "Action": [
                    "lambda:InvokeFunction"
                  ],
                  "Resource": [
                    "*"
                  ]
                },
              ]
            }
        }]
      }                
    }
})
