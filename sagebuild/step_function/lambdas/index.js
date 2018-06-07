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
                "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"
            ]
          }
        }
    })


