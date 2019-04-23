var fs=require('fs')
var _=require('lodash')
var build=require('./build').build
var train=require('./train')
var deploy=require('./deploy')
var step=require('./stepfunctions').step

states={
    "Comment": "",
    "StartAt": "start",
    "States": Object.assign(
        train,deploy,step("IfTrain","ETL"),step("Success","PostProcess"),
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
            Next:"IfETL",
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


