var fs=require('fs')
var Promise=require('bluebird')
var _=require('lodash')

var params=require('../info/parameters')
var params=Object.assign(_.fromPairs(Object.keys(params)
    .filter(x=>params[x].Type!=="CommaDelimitedList")
    .filter(x=>x!=="HyperParameters")
    .filter(x=>x!=="Parameters")
    .map(x=>[x.toLowerCase(),`\${${x}}`])),
    {
        "maxtrainingjobs":1,
        "configtrain":"SAGEMAKER",
        "endpointname":"${Variables.EndpointName}",
        "stackname":"${AWS::StackName}",
        "ecrrepo":"${ECRRepo}",
        "modelrole":"${ModelRole.Arn}",
        "trainingrole":"${TrainingRole.Arn}",
        "databucket":"${Variables.DataBucket}",
        "artifactbucket":"${ArtifactBucket}",
        "assetbucket":"${AssetBucket}",
        "statustopic":"${TrainStatusTopic}",
        "accountid":"${AWS::AccountId}",
        "codebucket":"${CodeBucket}",
        "projectname":"${ImageBuild}",
        "ETLStepFuction":"${ETLStepFuction}",
        "PostProcessStepFuction":"${PostProcessStepFuction}",
        hostinstancecount:"1",
        hostinstancetype:"ml.t2.medium",
        traininstancecount:"1",
        traininstancetype:"ml.m5.large",
        trainvolumesize:"10",
        inputmode:"File",
        modelhostingenvironment:{},
        trainmaxrun:"4",
        "maxparalleltrainingjobs":1,
        "checkpointbucket":"${CheckPointBucket}",
    })

var FrameworkParams=Object.assign(params,{
    enablecloudwatchmetrics:"false",
    framework:"${ConfigFramework}",
    containerloglevel:"200",
    trainentrypoint:"none",
    trainsourcefile:"none",
    hostsourcefile:"none",
    hostentrypoint:"none",
    pyversion:"py3",
})

var MXNETParams=Object.assign(FrameworkParams,{
    "frameworkversion":"1.1",
})
var TensorFlowParams=Object.assign(FrameworkParams,{
    "frameworkversion":"1.8",
})

var SciKitParams=Object.assign(FrameworkParams,{
    "frameworkversion":"0.20.0",
})

var ChainerParams=Object.assign(FrameworkParams,{
    "frameworkversion":"4.1.0",
})
var PyTorchParams=Object.assign(FrameworkParams,{
    "frameworkversion":"1.0.0",
})
var AmazonParams=Object.assign(params,{
    algorithm:"xgboost"
})

var BYODParams=Object.assign(params,{
    dockerfile_path_Training:"training/docker",
    dockerfile_path_Inference:"inference/docker"
})

function insert(x){
    return {"Fn::Sub":JSON.stringify(x).replace(/"HyperParameters"/,"${HyperParameters}")}
}
module.exports=Object.assign(
    require('./lambdas'),
    require('./stateMachines').StateMachine,
    require('./launch'),{
    "ParameterStore":{
        "Type" : "AWS::SSM::Parameter",
        "Properties" : {
            "Type" :"String",
            "Value" :{"Fn::If":[
                "ConfigFrameworkBYOD",
                insert(BYODParams),
                {"Fn::If":[
                    "ConfigFrameworkMXNET",
                    insert(MXNETParams),
                    {"Fn::If":[
                        "ConfigFrameworkTENSORFLOW",
                        insert(TensorFlowParams),
                        {"Fn::If":[
                            "ConfigFrameworkAMAZON",
                            insert(AmazonParams),
                            {"Fn::If":[
                                "ConfigFrameworkSCIKIT",
                                insert(SciKitParams),
                                {"Fn::If":[
                                    "ConfigFrameworkCHAINER",
                                    insert(ChainerParams),
                                    {"Fn::If":[
                                        "ConfigFrameworkPYTORCH",
                                        insert(PyTorchParams),
                                        insert(params)
                                    ]}
                                ]}
                            ]}
                        ]}
                    ]}
                ]}
            ]}
        }
    },
    "ParameterStoreOverride":{
        "Type": "Custom::ParamterUpdate",
        "DependsOn":["CFNLambdaPolicy"],
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["ParameterUpdateLambda", "Arn"] },
            "name":{"Ref":"ParameterStore"},
            "value":{"Ref":"Parameters"}
        }
    },
    "VersionParameterStore":{
        "Type" : "AWS::SSM::Parameter",
        "Properties" : {
            "Type" :"String",
            "Value":JSON.stringify({
                version_number:0,
                model_name:"NA"
            })
        }
    },
    "ModelClear":{
        "Type": "Custom::SageMakerModelClear",
        "DependsOn":["CFNLambdaPolicy","EndpointConfigClear"],
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["SageMakerClearModelLambda", "Arn"] },
            "name":{"Fn::Sub":"${AWS::StackName}"}
        }
    },
    "EndpointConfigClear":{
        "Type": "Custom::SageMakerEndpointConfigClear",
        "DependsOn":["CFNLambdaPolicy","EndpointClear"],
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["SageMakerClearEndpointConfigLambda", "Arn"] },
            "name":{"Fn::Sub":"${AWS::StackName}"}
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
        "Properties" : {
            VersioningConfiguration:{
                Status:"Enabled"
            }
        }
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
        Condition:"CreateDataBucket"
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
        "ManagedPolicyArns":[
            {"Fn::If":["ExternalHostingPolicy",
                {"Ref":"ExternalHostingPolicy"},
                {"Ref":"AWS::NoValue"}
            ]}
        ],
        "Policies":[{
            "PolicyName":"Access",
            "PolicyDocument": {
              "Version": "2012-10-17",
              "Statement": [{
                    "Effect": "Allow",
                    "Action": [
                        "sagemaker:*",
                        "cloudwatch:PutMetricData",
                        "logs:CreateLogStream",
                        "logs:PutLogEvents",
                        "logs:CreateLogGroup",
                        "logs:DescribeLogStreams",
                        "ecr:GetAuthorizationToken",
                        "ecr:GetDownloadUrlForLayer",
                        "ecr:BatchGetImage",
                        "ecr:BatchCheckLayerAvailability",
                        "cloudwatch:PutMetricData",
                        "cloudwatch:PutMetricAlarm",
                        "cloudwatch:DescribeAlarms",
                        "cloudwatch:DeleteAlarms",
                        "ec2:CreateNetworkInterface",
                        "ec2:CreateNetworkInterfacePermission",
                        "ec2:DeleteNetworkInterface",
                        "ec2:DeleteNetworkInterfacePermission",
                        "ec2:DescribeNetworkInterfaces",
                        "ec2:DescribeVpcs",
                        "ec2:DescribeDhcpOptions",
                        "ec2:DescribeSubnets",
                        "ec2:DescribeSecurityGroups",
                        "application-autoscaling:DeleteScalingPolicy",
                        "application-autoscaling:DeleteScheduledAction",
                        "application-autoscaling:DeregisterScalableTarget",
                        "application-autoscaling:DescribeScalableTargets",
                        "application-autoscaling:DescribeScalingActivities",
                        "application-autoscaling:DescribeScalingPolicies",
                        "application-autoscaling:DescribeScheduledActions",
                        "application-autoscaling:PutScalingPolicy",
                        "application-autoscaling:PutScheduledAction",
                        "application-autoscaling:RegisterScalableTarget",
                        "logs:CreateLogGroup",
                        "logs:CreateLogStream",
                        "logs:DescribeLogStreams",
                        "logs:GetLogEvents",
                        "logs:PutLogEvents"
                    ],
                    "Resource": "*"
                },
                {
                    "Effect": "Allow",
                    "Action": [
                        "s3:*",
                    ],
                    "Resource": [
                        {"Fn::Sub":"arn:aws:s3:::${CodeBucket}/*"},
                        {"Fn::Sub":"arn:aws:s3:::${CodeBucket}"}
                    ]
                },
                {
                    "Effect": "Deny",
                    "Action": [
                        "s3:Put*",
                        "s3:Delete*",
                    ],
                    "Resource": [
                        {"Fn::Sub":"arn:aws:s3:::${CodeBucket}/*"},
                        {"Fn::Sub":"arn:aws:s3:::${CodeBucket}"}
                    ]
                },
                {
                    "Effect": "Allow",
                    "Action": [
                        "s3:GetObject",
                        "s3:Get*",
                        "s3:PutObject",
                        "s3:Head*",
                    ],
                    "Resource": [
                        {"Fn::Sub":"arn:aws:s3:::${Variables.DataBucket}/*"},
                        {"Fn::Sub":"arn:aws:s3:::${ArtifactBucket}/*"},
                        {"Fn::Sub":"arn:aws:s3:::${CodeBucket}/*"},
                        {"Fn::Sub":"arn:aws:s3:::${CodeBucket}"}
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
             },
             {
				"Action": "iam:CreateServiceLinkedRole",
				"Effect": "Allow",
				"Resource": "arn:aws:iam::*:role/aws-service-role/sagemaker.application-autoscaling.amazonaws.com/AWSServiceRoleForApplicationAutoScaling_SageMakerEndpoint",
				"Condition": {
					"StringLike": {
				        "iam:AWSServiceName": "sagemaker.application-autoscaling.amazonaws.com"
				    }
				}
			},
			{
				"Effect": "Allow",
				"Action": ["iam:PassRole"],
				"Resource": "*",
				"Condition": {
					"StringEquals": {
						"iam:PassedToService": "sagemaker.amazonaws.com"
					}
				}
            }]
        }
      }]                
    }},
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
        "ManagedPolicyArns":[
            "arn:aws:iam::aws:policy/AmazonSageMakerFullAccess",
            {"Fn::If":["ExternalTrainingPolicy",
                {"Ref":"ExternalTrainingPolicy"},
                {"Ref":"AWS::NoValue"}
            ]}
        ],
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
                        "s3:*",
                    ],
                    "Resource": [
                        {"Fn::Sub":"arn:aws:s3:::${Variables.DataBucket}/*"},
                        {"Fn::Sub":"arn:aws:s3:::${ArtifactBucket}/*"},
                        {"Fn::Sub":"arn:aws:s3:::${CodeBucket}/*"},
                        {"Fn::Sub":"arn:aws:s3:::${CodeBucket}"},
                        {"Fn::Sub":"arn:aws:s3:::${CheckPointBucket}/*"},
                        {"Fn::Sub":"arn:aws:s3:::${CheckPointBucket}"},
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
