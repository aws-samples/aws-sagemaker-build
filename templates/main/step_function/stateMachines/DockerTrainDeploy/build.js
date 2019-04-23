var fs=require('fs')
var _=require('lodash')
var Promise=require('bluebird')

exports.build=function build(name,next){
    return _.mapKeys({
        "IfBuild":{
            Type:"Choice",
            Choices:[{
                Variable:`$.params.build.${name}`,
                BooleanEquals:false,
                Next:`EndBuild${name}` 
            },{
                Variable:`$.params.build.${name}`,
                BooleanEquals:true,
                Next:`buildImage${name}` 
            }],
            Default:`buildImage${name}`
        },
        "buildImage":{
            Type:"Task",
            Resource:`\${StepLambdaStartBuild${name}.Arn}`,
            ResultPath:`$.outputs.build.${name}`,
            Next:`wait${name}`
        },
        "wait":{
            Type:"Wait",
            Seconds:5,
            Next:`buildStatus${name}`
        },
        "buildStatus":{
            Type:"Task",
            Resource:`\${StepLambdaBuildStatus${name}.Arn}`,
            ResultPath:`$.status.build.${name}`,
            Next:`checkImage${name}`
        },
        "checkImage":{
            Type:"Choice",
            Choices:[{
                Variable:`$.status.build.${name}.buildStatus`,
                StringEquals:"IN_PROGRESS",
                Next:`wait${name}` 
            },{
                Variable:`$.status.build.${name}.buildStatus`,
                StringEquals:"SUCCEEDED",
                Next:`EndBuild${name}` 
            }],
            Default:`FailBuildNotification${name}`
        },
        "EndBuild":{
            Type:"Pass",
            Next:next
        },
        "FailBuildNotification":{
            Type:"Task",
            Resource:"${StepLambdaNotificationFail.Arn}",
            Next:`Fail`
        }
    },(x,key)=>`${key}${name}`)
}
