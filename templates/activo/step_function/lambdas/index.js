var fs=require('fs')
var _=require('lodash')
var UglifyJS = require("uglify-es");
var chalk=require('chalk')
var recursive = require('recursive-readdir-synchronous');

var len=__dirname.split('/').length
var lambdas=recursive(__dirname,['index.js'])
    .map(x=>x.split('/').slice(len).join('/'))
    .map(x=>[`StepFunction${x.replace(/\//g,'').split('.')[0]}`,lambda(x,'StepFunction')])

module.exports=Object.assign(_.fromPairs(lambdas),{
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
                "arn:aws:iam::aws:policy/AWSXrayWriteOnlyAccess",
                "arn:aws:iam::aws:policy/AWSLambdaFullAccess",
                "arn:aws:iam::aws:policy/ComprehendFullAccess"
            ],
            "Policies":[{
                "PolicyName":"Access",
                "PolicyDocument": {
                  "Version": "2012-10-17",
                  "Statement": [{
                        Effect:"Allow",
                        Action:[
                            "s3:*","glue:*","cloudformation:*"
                        ],
                        "Resource":"*"
                  },{
                        Effect:"Allow",
                        Action:[
                            "neptune-db:*"
                        ],
                        "Resource": ["arn:aws:neptune-db:*:*:*/*"]
                  }]
                }
            }]
          }
        }
    },{
        
    })

function lambda(file,type,version=false){
    var name=file.replace('/','').split('.')[0] 
    if(!version){
        var code=fs.readFileSync(__dirname+`/${file}`,'utf-8')
        var result = UglifyJS.minify(code,{mangle:false})
        if(result.error) throw `${name} ${result.error}`
        if(result.code.length<4096){
            console.log(`${type}:${Name(name)}`, chalk.green(`${result.code.length}/4096`))
        }else{
            console.log(`${type}:${Name(name)}`, chalk.red(`${result.code.length}/4096`))
        }
    }
    return {
      "Type": "AWS::Lambda::Function",
      "Properties": {
        "Code": version ? {
            S3Bucket:{"Ref":"AssetBucket"},
            S3Key:{"Fn::Sub":`\${AssetPrefix}/lambda/${file}.zip`},
            S3ObjectVersion:version
        }:{
            "ZipFile":code.length<4096 ? code : result.code
        },
        "Handler": "index.handler",
        "MemorySize": "1024",
        "Role": {"Fn::GetAtt": ["StepLambdaRole","Arn"]},
        "Runtime": "nodejs8.10",
        "Environment":{
            "Variables":{
            }
        },
        "TracingConfig":{
            "Mode":"Active"
        },
        Layers:[{"Ref":"UtilLambdaLayer"}],
        "Timeout": 60*15,
        "Tags":[{
            Key:"Type",
            Value:type
        }]
      }
    }
}

function Name(file){
    return file.replace('/','')
}
