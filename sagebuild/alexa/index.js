var fs=require('fs')
var UglifyJS = require("uglify-es");
var _=require('lodash')

module.exports={
    "AlexaLambda":lambda("handler.js"),
    "AlexaPermissions":{
      "Type" : "AWS::Lambda::Permission",
      "Properties" : {
        "Action" : "lambda:InvokeFunction",
        "FunctionName" : {"Fn::GetAtt":["AlexaLambda","Arn"]},
        "Principal" : "alexa-appkit.amazon.com"
      }
    },
    "AlexaLambdaRole":{
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
            "arn:aws:iam::aws:policy/AWSStepFunctionsReadOnlyAccess",
        ],
        "Policies":[{
            "PolicyName":"StartBuild",
            "PolicyDocument":{
                "Version" : "2012-10-17",
                "Statement":{
                    Effect:"Allow",
                    Action:"sns:*",
                    Resource:{"Ref":"LaunchTopic"}
                }
            }
        }]
      }
    }
}

function lambda(name){
    var code=fs.readFileSync(__dirname+`/${name}`,'utf-8')
    var result = UglifyJS.minify(code,{mangle:false});
    console.log(`alexa:${name} ${result.code.length}/4096`)
    return {
      "Type": "AWS::Lambda::Function",
      "Properties": {
        "Code": {
            "ZipFile":result.code
        },
        "Handler": "index.handler",
        "Environment":{
            "Variables":{
                STEPFUNCTION_ARN:{"Ref":"StateMachine"},
                START_TOPIC:{"Ref":"LaunchTopic"}
            }
        },
        "MemorySize": "128",
        "Role": {"Fn::GetAtt": ["AlexaLambdaRole","Arn"]},
        "Runtime": "nodejs6.10",
        "Timeout": 60
      }
    }
}




