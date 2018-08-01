var fs=require('fs')


module.exports={
    "RollbackTopic":{
        "Type" : "AWS::SNS::Topic",
        "Properties" :{
            DisplayName:{"Fn::Sub":"${AWS::StackName}-rollback"},
            Subscription:[{
                Endpoint:{"Fn::GetAtt":["RollbackLambda","Arn"]},
                Protocol:"lambda"
            }]
        }
    },
    "RollbackLambdaSNSPolicy":{
        "Type": "AWS::Lambda::Permission",
        "Properties": {
            "FunctionName": {"Fn::GetAtt":["RollbackLambda","Arn"]},
            "Action": "lambda:InvokeFunction",
            "Principal": "sns.amazonaws.com",
            "SourceArn":{"Ref":"RollbackTopic"}
        }
    },
    "LaunchTopic":{
        "Type" : "AWS::SNS::Topic",
        "Properties" :{
            DisplayName:{"Fn::Sub":"${AWS::StackName}-launch"},
            Subscription:[{
                Endpoint:{"Fn::GetAtt":["LaunchLambda","Arn"]},
                Protocol:"lambda"
            }]
        }
    },
    "LaunchLambdaSNSPolicy":{
        "Type": "AWS::Lambda::Permission",
        "Properties": {
            "FunctionName": {"Fn::GetAtt":["LaunchLambda","Arn"]},
            "Action": "lambda:InvokeFunction",
            "Principal": "sns.amazonaws.com",
            "SourceArn":{"Ref":"LaunchTopic"}
        }
    },
    "ExternalLaunchLambdaSNSPolicy":{
        "Type": "AWS::Lambda::Permission",
        Condition:"SubscribeToExternalTopic",
        "Properties": {
            "FunctionName": {"Fn::GetAtt":["LaunchLambda","Arn"]},
            "Action": "lambda:InvokeFunction",
            "Principal": "sns.amazonaws.com",
            "SourceArn":{"Ref":"ExternalLaunchTopic"}
        }
    },
    "ExternalLaunchLambdaSubscription":{
        "Type" : "AWS::SNS::Subscription",
        Condition:"SubscribeToExternalTopic",
        "Properties" : {
            Endpoint:{"Fn::GetAtt":["LaunchLambda","Arn"]},
            Protocol:"lambda",
            "TopicArn" : {"Ref":"ExternalLaunchTopic"}
        }
    },
    "LaunchTopicPolicy":{
        "Type" : "AWS::SNS::TopicPolicy",
        "Properties" : {
            "PolicyDocument" :  {
            "Id" : "MyTopicPolicy",
            "Version" : "2012-10-17",
            "Statement" : [ {
                "Sid" : "S3Access",
                "Effect" : "Allow",
                "Principal" : {"AWS":"*"},
                "Action" : "sns:Publish",
                "Resource" : { "Ref" : "LaunchTopic" },
                "Condition":{
                    ArnLike:{"AWS:SourceArn":{
                        "Fn::Sub":"arn:aws:s3:::${Variables.DataBucket}"
                    }}
                }
                },{
                "Sid" : "CodeCommit",
                "Effect" : "Allow",
                "Principal" : {"AWS":"*"},
                "Action" : "sns:Publish",
                "Resource" : { "Ref" : "LaunchTopic" },
                "Condition":{
                    ArnLike:{"AWS:SourceArn":{"Fn::GetAtt":["CodeRepo","Arn"]}}
                }
                }]
            },
            "Topics" : [ { "Ref" : "LaunchTopic" } ]
        }
    },
    "DataBucketSNS":{
        "Type": "Custom::S3Notification",
        "DependsOn":["CFNLambdaPolicy","LaunchTopicPolicy"],
        Condition:"CreateDataBucket",
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["S3NotificationLambda", "Arn"] },
            "Bucket":{"Fn::GetAtt":["Variables","DataBucket"]},
            NotificationConfiguration:{
                TopicConfigurations:[{
                    Events:["s3:ObjectCreated:*"],
                    TopicArn:{"Ref":"LaunchTopic"}
                }]
            }
        }
    },
    "LaunchLambda":{
      "Type": "AWS::Lambda::Function",
      "Properties": {
        "Code": {
            "ZipFile":fs.readFileSync(__dirname+`/handler.js`,'utf-8')
        },
        "Environment":{
            Variables:{
                STATE_MACHINE:{"Ref":"StateMachine"},
                DATA_BUCKET:{"Fn::GetAtt":["Variables","DataBucket"]},
                CODE_BUCKET: {"Ref":"ExternalCodeBucket"},
                CONFIG_FRAMEWORK:{"Ref":"ConfigFramework"},
                CONFIG_DEPLOY:{"Ref":"ConfigDeploy"}
            }
        },
        "Handler": "index.handler",
        "MemorySize": "128",
        "Role": {"Fn::GetAtt": ["LaunchLambdaRole","Arn"]},
        "Runtime": "nodejs6.10",
        "Timeout": 60
      }
    },
    "RollbackLambda":{
      "Type": "AWS::Lambda::Function",
      "Properties": {
        "Code": {
            "ZipFile":fs.readFileSync(__dirname+`/rollback.js`,'utf-8')
        },
        "Environment":{
            Variables:{
                ENDPOINT:{"Ref":"AWS::StackName"},
            }
        },
        "Handler": "index.handler",
        "MemorySize": "128",
        "Role": {"Fn::GetAtt": ["RollbackLambdaRole","Arn"]},
        "Runtime": "nodejs6.10",
        "Timeout": 60
      }
    },
    "RollbackLambdaRole":{
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
            "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
        ]
      }
    },
    "LaunchLambdaRole":{
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
            "arn:aws:iam::aws:policy/AWSStepFunctionsFullAccess"
        ]
      }
    }
}
