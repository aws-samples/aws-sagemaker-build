var fs=require('fs')
var _=require('lodash')
var Promise=require('bluebird')

exports.build=function build(name){
    return {
        StartAt:`buildImageType${name}`,
        States:_.mapKeys({
            "buildImageType":{
                Type:"Pass",
                Result:name,
                ResultPath:`$.params.buildtype`,
                Next:`buildImage${name}`
            },
            "buildImage":{
                Type:"Task",
                Resource:"${StepLambdaStartBuild.Arn}",
                ResultPath:`$.outputs.build`,
                Next:`wait${name}`
            },
            "wait":{
                Type:"Wait",
                Seconds:5,
                Next:`buildStatus${name}`
            },
            "buildStatus":{
                Type:"Task",
                Resource:"${StepLambdaBuildStatus.Arn}",
                ResultPath:`$.status.build`,
                Next:`checkImage${name}`
            },
            "checkImage":{
                Type:"Choice",
                Choices:[{
                    Variable:`$.status.build.buildStatus`,
                    StringEquals:"IN_PROGRESS",
                    Next:`wait${name}` 
                },{
                    Variable:`$.status.build.buildStatus`,
                    StringEquals:"SUCCEEDED",
                    Next:`EndBuild${name}` 
                }],
                Default:`FailBuildNotification${name}`
            },
            "EndBuild":{
                Type:"Pass",
                End:true
            },
            "FailBuildNotification":{
                Type:"Task",
                Resource:"${StepLambdaNotificationFail.Arn}",
                Next:`FailBuild${name}`
            },
            "FailBuild":{
                Type:"Fail"
            }
        },(x,key)=>`${key}${name}`)
    }
}
