var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var sagemaker=new aws.SageMaker()

exports.handler=(event,context,callback)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
    if(event.params.ModelArtifacts){
        var ModelDataUrl=event.params.ModelArtifacts
    }else if(event.status.training.ModelArtifacts){
        var ModelDataUrl=event.status.training.ModelArtifacts.S3ModelArtifacts 
    }else{
        var ModelDataUrl=`${event.status.training.TrainingJobDefinition.OutputDataConfig.S3OutputPath}/${event.status.training.BestTrainingJob.TrainingJobName}/output/model.tar.gz`
    }

    try{
        callback(null,{
            ExecutionRoleArn:event.params.modelrole,
            ModelName:`${event.params.name}-${event.params.id}`,
            PrimaryContainer:{
                Image:event.params.InferenceImage || `${event.params.accountid}.dkr.ecr.${process.env.AWS_REGION}.amazonaws.com/${event.params.ecrrepo}:Inference_v${event.params.version}`,
                ModelDataUrl,
                Environment:event.params.modelhostingenvironment
            },
            Tags:[{
                Key:"sagebuild:stack",
                Value:event.params.stackname
            }]
        })
    }catch(e){
        callback(new Error(e))
    }
}
