var fs=require('fs')
var Promise=require('bluebird')

module.exports={
    "CodeRepo":{
        "Type" : "AWS::CodeCommit::Repository",
        Condition:"CreateRepo",
        "Properties" : {
            RepositoryName:{"Ref":"AWS::StackName"}
        }
    },
    "CodeTrigger":{
        "Type": "Custom::CodeCommitTrigger",
        "DependsOn":["CFNLambdaPolicy"],
        Condition:"CreateRepoTrigger",
        "Properties":{
            "ServiceToken": { "Fn::GetAtt" : ["CodeCommitTriggerLambda", "Arn"] },
            "repositoryName":{"Fn::GetAtt":["Variables","RepoName"]},
            "trigger":{
                branches:{"Ref":"BranchBuildTrigger"},
                destinationArn:{"Ref":"LaunchTopic"},
                events:["all"],
                name:{"Ref":"AWS::StackName"}
            }
        }
    },
    "ECRRepo":{
        "Type" : "AWS::ECR::Repository",
        "Properties":{
            RepositoryPolicyText:{
                "Version": "2012-10-17",
                    "Statement": [{
                    "Effect": "Allow",
                    "Principal": {
                        "Service": "codebuild.amazonaws.com"  
                    },
                    "Action": [
                        "ecr:GetDownloadUrlForLayer",
                        "ecr:BatchGetImage",
                        "ecr:BatchCheckLayerAvailability"
                    ]
                },{
                    "Effect": "Allow",
                    "Principal": {
                        "Service": "sagemaker.amazonaws.com"  
                    },
                    "Action": [
                        "ecr:GetAuthorizationToken",
                        "ecr:BatchCheckLayerAvailability",
                        "ecr:GetDownloadUrlForLayer",
                        "ecr:BatchGetImage"
                    ]
                }]
            }
        }
    },
    "ImageBuild":{
        "Type":"AWS::CodeBuild::Project",
        "Properties":{
            "Artifacts":{
                Type:"NO_ARTIFACTS"
            },
            "Environment":{
                ComputeType:"BUILD_GENERAL1_LARGE",
                EnvironmentVariables:[{
                    Name:"IMAGE_REPO_NAME",
                    Value:{"Ref":"ECRRepo"}
                },{
                    Name:"AWS_DEFAULT_REGION",
                    Value:{"Ref":"AWS::Region"}
                },{
                    Name:"AWS_ACCOUNT_ID",
                    Value:{"Ref":"AWS::AccountId"}
                },{
                    Name:"STACK_NAME",
                    Value:{"Ref":"AWS::StackName"}
                }],
                Image:"aws/codebuild/docker:17.09.0",
                PrivilegedMode:true,
                Type:"LINUX_CONTAINER"
            },
            "Name":{"Fn::Sub":"${AWS::StackName}-Image-build"},
            ServiceRole:{"Ref":"ServiceRole"},
            Source:{"Fn::If":[
                "UseCodeBucket",
                {
                    Type:"S3",
                    Location:{"Ref":"ExternalCodeBucket"},
                    BuildSpec:fs.readFileSync(`${__dirname}/buildspec.yml`,'utf-8')
                },
                {
                    Type:{"Fn::If":[
                        "IsCodeCommitRepo",
                        "CODECOMMIT",
                        "GITHUB"
                    ]},
                    Location:{"Fn::GetAtt":["Variables","RepoUrl"]},
                    BuildSpec:fs.readFileSync(`${__dirname}/buildspec.yml`,'utf-8'),
                    Auth:{"Fn::If":[
                        "IsCodeCommitRepo",
                        {"Ref":"AWS::NoValue"},
                        {"Type":"OAUTH"}
                    ]}
                }
            ]}
        }
    },
    "ClearECR":{
        "Type": "Custom::ClearImage",
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["ClearECRLambda", "Arn"] },
            "repo":{"Ref":"ECRRepo"}
        }
    },
    "ServiceRole": {
      "Type": "AWS::IAM::Role",
      "Properties": {
        "AssumeRolePolicyDocument": {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Principal": {
                "Service": "codebuild.amazonaws.com"
              },
              "Action": "sts:AssumeRole"
            }
          ]
        },
        "Path": "/",
        "ManagedPolicyArns": [
          "arn:aws:iam::aws:policy/AmazonECS_FullAccess",
          "arn:aws:iam::aws:policy/AmazonS3FullAccess"
        ],
        "Policies":[{
            "PolicyName":"codebuild",
            "PolicyDocument": {
              "Version": "2012-10-17",
              "Statement": [
                {
                  "Sid": "CloudWatchLogsPolicy",
                  "Effect": "Allow",
                  "Action": [
                    "logs:CreateLogGroup",
                    "logs:CreateLogStream",
                    "logs:PutLogEvents"
                  ],
                  "Resource": [
                    "*"
                  ]
                },
                {
                  "Sid": "CodeCommitPolicy",
                  "Effect": "Allow",
                  "Action": [
                    "codecommit:GitPull",
                    "ecr:*"
                  ],
                  "Resource": [
                    "*"
                  ]
                },
                {
                  "Sid": "S3GetObjectPolicy",
                  "Effect": "Allow",
                  "Action": [
                    "s3:GetObject",
                    "s3:GetObjectVersion"
                  ],
                  "Resource": [
                    "*"
                  ]
                },
                {
                  "Sid": "S3PutObjectPolicy",
                  "Effect": "Allow",
                  "Action": [
                    "s3:PutObject"
                  ],
                  "Resource": [
                    "*"
                  ]
                }
              ]
            }
        }]
      }
    }
}

