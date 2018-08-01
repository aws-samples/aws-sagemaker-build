var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var sagemaker=new aws.SageMaker()

exports.handler=(event,context,callback)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
    try{
        callback(null,{
            ExecutionRoleArn:event.params.modelrole,
            ModelName:`${event.params.name}-${event.params.id}`,
            PrimaryContainer:{
                Image:`${event.params.accountid}.dkr.ecr.${process.env.AWS_REGION}.amazonaws.com/${event.params.ecrrepo}:Inference_v${event.params.version}`,
                ModelDataUrl:event.status.training.ModelArtifacts.S3ModelArtifacts,
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
