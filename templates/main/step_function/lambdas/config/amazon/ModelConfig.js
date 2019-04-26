var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var sagemaker=new aws.SageMaker()
var create_image_uri=require('CreateImageURI').amazon
var s3=new aws.S3()

exports.handler=(event,context,callback)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
    if(event.status.training.ModelArtifacts){
        var ModelDataUrl=event.status.training.ModelArtifacts.S3ModelArtifacts 
    }else{
        var ModelDataUrl=`${event.status.training.TrainingJobDefinition.OutputDataConfig.S3OutputPath}/${event.status.training.BestTrainingJob.TrainingJobName}/output/model.tar.gz`
    }
   
    var key= `versions/inference/v${event.params.version}.py`
    callback(null,{
        ExecutionRoleArn:event.params.modelrole,
        ModelName:`${event.params.name}-${event.params.id}`,
        PrimaryContainer:{
            Image:create_image_uri(event.params),
            ModelDataUrl,
            Environment:event.params.modelhostingenvironment || {}
        },
        Tags:[{
            Key:"sagebuild:stack",
            Value:event.params.stackname
        }]
    })
}
