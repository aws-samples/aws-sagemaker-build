var fs=require('fs')
var UglifyJS = require("uglify-es");
var _=require('lodash')

var configs=fs.readdirSync(__dirname)
    .filter(x=>x!=='index.js')
    .filter(x=>x!=='README.md')

var lambdas=fs.readdirSync(`${__dirname}/sagemaker/`)
    .map(x=>x.split('.')[0])

module.exports=Object.assign(
    _.fromPairs(lambdas.map(lambda)),
    {})

function lambda(name){
    var info=getInfo(name)
    
    return [`StepLambda${name.split('.')[0]}`,{
      "Type": "AWS::Lambda::Function",
      "Properties": {
        "Environment":{
            "Variables":{
                "PARAMETERSTORE":{"Ref":"ParameterStore"},
                "VERSIONPARAMETERSTORE":{"Ref":"VersionParameterStore"},
            }
        },
        "Code": {
            "ZipFile":info.code
        },
        "Handler":"index.handler",
        "MemorySize": 128,
        "Layers":[{"Ref":"UtilLambdaLayer"}],
        "Role": {"Fn::GetAtt": ["StepLambdaRole","Arn"]},
        "Runtime": info.runtime,
        "Timeout": 60
      }
    }]
}

function getInfo(name){
    var types=configs.filter(x=>fs.readdirSync(`${__dirname}/${x}`)
        .map(x=>x.split('.')[0]).includes(name)
    )
    var code=types.map(type=>{
        try{
            var txt=fs.readFileSync(__dirname+`/${type}/${name}.js`,'utf-8')
            var result = UglifyJS.minify(txt,{mangle:false});
            var txt=result.code
            var js=true
        }catch(e){
            var txt=fs.readFileSync(__dirname+`/${type}/${name}.py`,'utf-8')
            var js=false
        }
        return {type,js,txt}
    })
    var base=code.find(x=>x.type==="sagemaker")
    return {code:nextCode(0),runtime:nextRuntime(0)}
    
    function nextCode(index){
        if(code[index]){
            return {"Fn::If":[
                `ConfigDeploy${code[index].type.toUpperCase()}`,
                code[index].txt,
                nextCode(++index)
            ]}
        }else{
            return base.txt
        }
    }
    function nextRuntime(index){
        if(code[index]){
            return {"Fn::If":[
                `ConfigDeploy${code[index].type.toUpperCase()}`,
                code[index].js ? "nodejs10.x" : "python3.6",
                nextRuntime(++index)
            ]}
        }else{
            return base.js ? "nodejs10.x" : "python3.6"
        }
    }
}
