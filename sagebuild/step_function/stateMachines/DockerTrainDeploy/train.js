var fs=require('fs')
var _=require('lodash')
var Promise=require('bluebird')
var build=require('./build').build
var rollback=require('./rollback')

module.exports={
    "getTrainingConfig":{
        Type:"Task",
        InputPath:"$",
        Resource:"${LambdaVariables.TrainingConfig}",
        ResultPath:"$.args.training",
        Next:"getDataConfig"
    },
    "getDataConfig":{
        Type:"Task",
        Resource:"${StepLambdaGetDataConfig.Arn}",
        ResultPath:'$.args.training.InputDataConfig',
        Next:"startTraining"
    },
    "startTraining":{
        Type:"Task",
        InputPath:"$",
        Resource:"${StepLambdaStartTraining.Arn}",
        ResultPath:"$.outputs.training",
        Next:"waitForTraining"
    },
    "waitForTraining":{
        Type:"Wait",
        Seconds:30,
        Next:"getTrainingStatus"
    },
    "getTrainingStatus":{
        Type:"Task",
        Resource:"${StepLambdaTrainingStatus.Arn}",
        ResultPath:"$.status.training",
        Next:"checkTrainingStatus"
    },
    "checkTrainingStatus":{
        Type:"Choice",
        Choices:[{
            Variable:`$.status.training.TrainingJobStatus`,
            StringEquals:"InProgress",
            Next:`waitForTraining` 
        },{
            Variable:`$.status.training.TrainingJobStatus`,
            StringEquals:"Completed",
            Next:`getModelConfig` 
        }],
        Default:`trainingFail`
    },
    "trainingFail":{
        Type:"Task",
        Resource:"${StepLambdaNotificationFail.Arn}",
        Next:"Fail"
    }
}


