var fs=require('fs')
var UglifyJS = require("uglify-es");
var chalk=require('chalk')
var _=require('lodash')

module.exports={
    "UtilCodeVersion":{
        "Type": "Custom::S3Version",
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["S3VersionLambda", "Arn"] },
            "Bucket": {"Ref":"AssetBucket"},
            "Key": {"Fn::Sub":"${AssetPrefix}/lambda/util.zip"},
            "BuildDate":(new Date()).toISOString()
        }
    },
    "UtilLambdaLayer":{
      "Type": "AWS::Lambda::LayerVersion",
      "Properties": {
        Content:{
            "S3Bucket":{"Ref":"AssetBucket"},
            "S3Key":{"Fn::Sub":"${AssetPrefix}/lambda/util.zip"},
            "S3ObjectVersion":{"Ref":"UtilCodeVersion"},
        },
        LayerName:{"Fn::Sub":"${AWS::StackName}-util"},
      }
    }
}
