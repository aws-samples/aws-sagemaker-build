var fs=require('fs')
var UglifyJS = require("uglify-es");

var _=require('lodash')
var lambdas=fs.readdirSync(__dirname)
    .filter(x=>!x.match(/index.js/))
    .map(x=>[`StepLambda${x.match(/(.*)\.js/)[1]}`,lambda(x)])

module.exports=Object.assign(
    _.fromPairs(lambdas),
{
})

function lambda(name){
    var code=fs.readFileSync(__dirname+`/${name}`,'utf-8')
    var result = UglifyJS.minify(code,{mangle:false});
    return {
      "Type": "AWS::Lambda::Function",
      "Properties": {
        "Code": {
            "ZipFile":result.code
        },
        "Handler": "index.handler",
        "MemorySize": 128,
        "Layers":[{"Ref":"UtilLambdaLayer"}],
        "Role": {"Fn::GetAtt": ["StepLambdaRole","Arn"]},
        "Runtime": "nodejs8.10",
        "Timeout": 60
      }
    }
}




