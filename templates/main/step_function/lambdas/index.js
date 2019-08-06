var fs=require('fs')
module.exports=Object.assign(
    Object.assign.apply({},fs.readdirSync(__dirname)
    .filter(x=>x!=='index.js')
    .filter(x=>x!=='README.md')
    .map(x=>require(`./${x}`))
    ),{
        "SageBuildLambdaRole":{
          "Type": "AWS::IAM::Role",
          "Properties": {
            "AssumeRolePolicyDocument": {
              "Version": "2012-10-17",
              "Statement": [
                {
                  "Effect": "Allow",
                  "Principal": {
                    "Service": "lambda.amazonaws.com"
                  },
                  "Action": "sts:AssumeRole"
                }
              ]
            },
            "Path": "/",
            "ManagedPolicyArns": [
                "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
            ]
          }
        },
        "StepLambdaRole":{
          "Type": "AWS::IAM::Role",
          "Properties": {
            "AssumeRolePolicyDocument": {
              "Version": "2012-10-17",
              "Statement": [
                {
                  "Effect": "Allow",
                  "Principal": {
                    "Service": "lambda.amazonaws.com"
                  },
                  "Action": "sts:AssumeRole"
                }
              ]
            },
            "Path": "/",
            "ManagedPolicyArns": [
                "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
                "arn:aws:iam::aws:policy/AmazonSageMakerFullAccess",
                "arn:aws:iam::aws:policy/AWSCodeBuildAdminAccess",
                "arn:aws:iam::aws:policy/AmazonSNSFullAccess",
                "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess",
                "arn:aws:iam::aws:policy/AWSStepFunctionsFullAccess"
            ],
            "Policies":[{
                "PolicyName":"Access",
                "PolicyDocument": {
                  "Version": "2012-10-17",
                  "Statement": [{
                        "Effect": "Allow",
                        "Action": [
                            "ssm:Get*",
                            "ssm:Put*",
                        ],
                        "Resource":[
                            {"Fn::Sub":"arn:aws:ssm:${AWS::Region}:${AWS::AccountId}:parameter/${ParameterStore}"},
                            {"Fn::Sub":"arn:aws:ssm:${AWS::Region}:${AWS::AccountId}:parameter/${VersionParameterStore}"}
                        ]
                  },{
                        "Effect": "Allow",
                        "Action": [
                            "s3:*",
                        ],
                        "Resource":[
                           {"Fn::GetAtt":["CodeBucket","Arn"]},
                           {"Fn::Sub":"${CodeBucket.Arn}/*"}
                        ]
                  },{"Fn::If":["Encryption",
                        {
                            "Effect": "Allow",
                            "Action": [
                                "kms:DescribeKey",
                                "kms:CreateGrant"
                            ],
                            "Resource": [
                                {"Fn::Sub":"arn:aws:kms:${AWS::Region}:${AWS::AccountId}:key/${KMSKeyId}"}
                            ]
                        }
                        ,
                        {"Ref":"AWS::NoValue"}
                    ]}]
                }
            }]
          }
        }
    })


