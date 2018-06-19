var fs=require('fs')
var _=require('lodash')
var Promise=require('bluebird')
var build=require('./build').build
var train=require('./train')
var deploy=require('./deploy')

states={
    "Comment": "",
    "StartAt": "start",
    "States": Object.assign(
        train,deploy,
    {
        "start":{
            Type:"Pass",
            Next:"initialize",
        },
        "initialize":{
            Type:"Task",
            Resource:"${StepLambdaInitialize.Arn}",
            Next:"listmodels",
        },
        "listmodels":{
            Type:"Task",
            Resource:"${StepLambdaListModels.Arn}",
            ResultPath:"$.params.models",
            Next:"IfBuild",
        },
        "IfBuild":{
            Type:"Choice",
            Choices:[{
                Variable:`$.params.build`,
                BooleanEquals:true,
                Next:`buildImages` 
            },{
                Variable:`$.params.build`,
                BooleanEquals:false,
                Next:`IfTrain` 
            }],
            Default:`buildImages`
        },
        "buildImages":{
            Type: "Parallel",
            Branches:[build('Training'),build('Inference')],
            ResultPath:"$.outputs.build",
            Next:"IfTrain"
        },
        "IfTrain":{
            Type:"Choice",
            Choices:[{
                Variable:`$.params.train`,
                BooleanEquals:true,
                Next:`getTrainingConfig` 
            },{
                Variable:`$.params.train`,
                BooleanEquals:false,
                Next:`getArtifact` 
            }],
            Default:`getTrainingConfig`
        },
        "getArtifact":{
            Type:"Task",
            Resource:"${StepLambdaGetArtifact.Arn}",
            Next:"getModelConfig",
        },
        "Success": {
            Type:"Task",
            Resource:"${StepLambdaNotificationSuccess.Arn}",
            End:true
        },
        "Error":{
            Type:"Task",
            Resource:"${StepLambdaNotificationFail.Arn}",
            Next:"Fail"
        },
        "Fail":{
            Type:"Fail"
        }
    })
}

states.States=_.fromPairs(_.toPairs(states.States)
    .map(state=>{
        if(state[1].Type==="Task" || state[1].Type==="Parallel"){
            return addCatch(state)
        }else{
            return state
        }
    }))

function addCatch(state){
    if(state[0]!=="Error"){
        state[1].Catch=[{
            "ErrorEquals":["States.ALL"],
            "ResultPath":"$.error",
            "Next":"Error"
        }]
    }
    return state
}

console.log(states)

module.exports=states


