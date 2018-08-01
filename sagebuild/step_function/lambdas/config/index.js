var fs=require('fs')
var _=require('lodash')

var configs=fs.readdirSync(__dirname)
    .filter(x=>x!=='index.js')
    .filter(x=>x!=='README.md')

var config_types=fs.readdirSync(`${__dirname}/byod/`)
    .map(x=>x.split('.')[0])

module.exports=_.fromPairs(config_types.map(lambda))
function lambda(name){
    var info=getInfo(name)
    return [`StepLambdaGet${name.split('.')[0]}`,{
      "Type": "AWS::Lambda::Function",
      "Properties": {
        "Environment":{
            "Variables":{}
        },
        "Code": {
            "ZipFile":info.code
        },
        "Handler":"index.handler",
        "MemorySize": "128",
        "Role": {"Fn::GetAtt": ["StepLambdaRole","Arn"]},
        "Runtime":info.runtime,
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
            var js=true
        }catch(e){
            var txt=fs.readFileSync(__dirname+`/${type}/${name}.py`,'utf-8')
            var js=false
        }
        return {type,js,txt}
    })
    var byod=code.find(x=>x.type==="byod")
    return {code:nextCode(0),runtime:nextRuntime(0)}
    function nextCode(index){
        if(code[index]){
            return {"Fn::If":[
                `ConfigFramework${code[index].type.toUpperCase()}`,
                code[index].txt,
                nextCode(++index)
            ]}
        }else{
            return byod.txt
        }
    }
    function nextRuntime(index){
        if(code[index]){
            return {"Fn::If":[
                `ConfigFramework${code[index].type.toUpperCase()}`,
                code[index].js ? "nodejs6.10" : "python3.6",
                nextRuntime(++index)
            ]}
        }else{
            return byod.js ? "nodejs6.10" : "python3.6"
        }
    }
}


