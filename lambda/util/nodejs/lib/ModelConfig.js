var create_image_uri=require('CreateImageURI')
var _=require('lodash')


exports.byod=function(event){
    var image=event.params.InferenceImage || `${event.params.accountid}.dkr.ecr.${process.env.AWS_REGION}.amazonaws.com/${event.params.ecrrepo}:Inference_v${event.params.version}`
    return base(event,image)
}

exports.amazon=function(event){
    var image=create_image_uri.amazon(event.params,false)
    return base(event,image)
}

exports.framework=function(event,name,key){
    var image=create_image_uri[name](event.params,false)
    var env={
        SAGEMAKER_CONTAINER_LOG_LEVEL:event.params.containerloglevel,
        SAGEMAKER_ENABLE_CLOUDWATCH_METRICS:event.params.enablecloudwatchmetrics,
        SAGEMAKER_PROGRAM:`${event.params.hostentrypoint}`,
        SAGEMAKER_REGION:`${process.env.AWS_REGION}`,
        SAGEMAKER_SUBMIT_DIRECTORY:`s3://${event.params.codebucket}/${key}`,
    }

    return base(event,image,env)
}

function base(event,image,env={}){

    if(event.params.ModelArtifacts){
        var ModelDataUrl=event.params.ModelArtifacts
    }else if(event.status.training.ModelArtifacts){
        var ModelDataUrl=event.status.training.ModelArtifacts.S3ModelArtifacts 
    }else{
        var ModelDataUrl=`${event.status.training.TrainingJobDefinition.OutputDataConfig.S3OutputPath}/${event.status.training.BestTrainingJob.TrainingJobName}/output/model.tar.gz`
    }

    out={
        ExecutionRoleArn:event.params.modelrole,
        ModelName:event.params.model,
        Tags:[{
            Key:"sagebuild:stack",
            Value:event.params.stackname
        }]
    }

    if(event.params.pipeline){
        containers=_.get(event,"params.pipeline",[])
            .map(x=>{return {
                Image:x.tag ? ecr_image(event,x.tag) : x.image,
                Environment:Object.assign(event.params.modelhostingenvironment || {},env)
            }})
            
        containers.push({
            Image:image,
            ModelDataUrl,
            Environment:Object.assign(event.params.modelhostingenvironment || {},env)
        })
        out.Containers=containers
    }else{
        out.PrimaryContainer={
            Image:image,
            ModelDataUrl,
            Environment:Object.assign(event.params.modelhostingenvironment || {},env)
        }
    }
    return out
}

function ecr_image(event,tag){
    return event.params.InferenceImage || `${event.params.accountid}.dkr.ecr.${process.env.AWS_REGION}.amazonaws.com/${event.params.ecrrepo}:${tag}`

}
