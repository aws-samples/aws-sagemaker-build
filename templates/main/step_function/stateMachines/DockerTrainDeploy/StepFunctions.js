var fs=require('fs')
var _=require('lodash')
var Promise=require('bluebird')

exports.step=function build(next,name){
    return _.mapKeys({
        "If":{
            Type:"Choice",
            Choices:[{
                Variable:`$.params.${name}StepFuction`,
                StringEquals:"EMPTY",
                Next:`End${name}` 
            }],
            Default:`Start${name}`
        },
        "Start":{
            Type:"Task",
            Resource:`\${StepLambdaStart${name}Execution.Arn}`,
            ResultPath:`$.outputs.${name}`,
            Next:`wait${name}`
        },
        "wait":{
            Type:"Wait",
            Seconds:5,
            Next:`Status${name}`
        },
        "Status":{
            Type:"Task",
            Resource:`\${StepLambdaCheckExecution${name}.Arn}`,
            ResultPath:`$.status.${name}`,
            Next:`check${name}`
        },
        "check":{
            Type:"Choice",
            Choices:[{
                Variable:`$.status.${name}.status`,
                StringEquals:"RUNNING",
                Next:`wait${name}` 
            },{
                Variable:`$.status.${name}.status`,
                StringEquals:"SUCCEEDED",
                Next:`End${name}` 
            }],
            Default:`FailNotification${name}`
        },
        "End":{
            Type:"Pass",
            Next:next
        },
        "FailNotification":{
            Type:"Task",
            Resource:"${StepLambdaNotificationFail.Arn}",
            Next:`Fail`
        }
    },(x,key)=>`${key}${name}`)
}
