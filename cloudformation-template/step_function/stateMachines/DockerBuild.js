var fs=require('fs')
var _=require('lodash')
var Promise=require('bluebird')

module.exports={
    "Comment": "",
    "StartAt": "start",
    "States": {
        "start":{
            Type:"Pass",
            Next:"buildImages"
        },
        "buildImages":{
            Type: "Parallel",
            Branches:[build('Training'),build('Inference')],
            Next:"Success"
        },
        "Success": {
            Type:"Task",
            Resource:"${StepLambdaNotificationSuccess.Arn}",
            End:true
        }
    }
}

function build(name){
    return {
        StartAt:`startBuildImage${name}`,
        States:_.mapKeys({
            "startBuildImage":{
                Type:"Pass",
                Result:{
                    projectName:"${ImageBuild}",
                    SNSTopic:"${TrainStatusTopic}",
                    tag:name
                },
                Next:`buildImagePath${name}`
            },
            "buildImagePath":{
                Type:"Task",
                Resource:`\${StepLambdaGet${name}DockerfilePath.Arn}`,
                ResultPath:`$.dockerfile_path`,
                Next:`buildImage${name}`
            },
            "buildImage":{
                Type:"Task",
                Resource:"${StepLambdaStartBuild.Arn}",
                ResultPath:`$.build.${name}`,
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
                InputPath:`$.build.${name}`,
                ResultPath:`$.build.${name}`,
                Next:`checkImage${name}`
            },
            "checkImage":{
                Type:"Choice",
                Choices:[{
                    Variable:`$.build.${name}.buildStatus`,
                    StringEquals:"IN_PROGRESS",
                    Next:`wait${name}` 
                },{
                    Variable:`$.build.${name}.buildStatus`,
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
