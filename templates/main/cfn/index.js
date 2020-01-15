var fs=require('fs')
var UglifyJS = require("uglify-es");

var _=require('lodash')
var lambdas=fs.readdirSync(__dirname)
    .filter(x=>!x.match(/index.js/))
    .map(x=>[`${x.match(/(.*)\.js/)[1]}Lambda`,lambda(x)])

module.exports=Object.assign(
    _.fromPairs(lambdas),
{
    "CFNLambdaRole":{
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
            "arn:aws:iam::aws:policy/AWSCodeCommitFullAccess",
            "arn:aws:iam::aws:policy/AWSLambdaFullAccess"
        ]
      }
    },
    "CFNLambdaPolicy":{
      "Type": "AWS::IAM::ManagedPolicy",
      "Properties": {
        "Roles":[{"Ref":"CFNLambdaRole"}],
        "PolicyDocument": {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Action": [
                "s3:*"
              ],
              "Resource":[
                {"Fn::Sub":"arn:aws:s3:::${Variables.DataBucket}*"},
                {"Fn::Sub":"arn:aws:s3:::${AssetBucket}*"}
              ]
            },
            {
              "Effect": "Allow",
              "Action": [
                "ecr:*"
              ],
              "Resource":"*"
            },
            {
              "Effect": "Allow",
              "Action": [
                "ssm:Get*",
                "ssm:Put*"
              ],
              "Resource":{"Fn::Sub":"arn:aws:ssm:${AWS::Region}:${AWS::AccountId}:parameter/${ParameterStore}"}
            }
          ]
        }
      }
    }
})

function lambda(name){
    var code=fs.readFileSync(__dirname+`/${name}`,'utf-8')
    var result = UglifyJS.minify(code,{mangle:false});
    var out={
      "Type": "AWS::Lambda::Function",
      "Properties": {
        "Code": {
            "ZipFile":result.code
        },
        "Handler": "index.handler",
        "MemorySize": 128,
        "Role": {"Fn::GetAtt": ["CFNLambdaRole","Arn"]},
        "Runtime": "nodejs10.x",
        "Timeout": 60
      }
    }

    if(name!=="S3Version.js"){
        out.Properties.Layers=[{"Ref":"UtilLambdaLayer"}]
    }
    return out
}




