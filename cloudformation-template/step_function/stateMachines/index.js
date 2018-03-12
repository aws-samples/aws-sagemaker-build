var _=require('lodash')
var fs=require('fs')

var machines=fs.readdirSync(__dirname)
    .filter(x=>x!=='index.js')
    .map(x=>x.match(/(.*)\.js/)[1])

exports.machines=machines

exports.conditions=_.fromPairs(machines.map(x=>[
    `StateMachine${x}`,
    {"Fn::Equals":[{"Ref":"Type"},x]}
]))

exports.StateMachine={
    StateMachine:{
        "Type": "AWS::StepFunctions::StateMachine",
        "Properties": {
            "DefinitionString":next(0),
            "RoleArn":{"Fn::GetAtt":["StepFunctionRole","Arn"]}
        }
    }
}

exports.conditional=next(0)

function next(index){
    if(exports.machines[index]){
        return {"Fn::If":[
            `StateMachine${exports.machines[index]}`,
            {"Fn::Sub":JSON.stringify(require('./DockerTrainDeploy'))},
            next(++index)
        ]}
    }else{
        return {"Ref":"AWS::NoValue"}
    }
}


