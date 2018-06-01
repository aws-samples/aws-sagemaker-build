var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var sagemaker=new aws.SageMaker()

exports.handler=(event,context,callback)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))

    callback(null,{
        ExecutionRoleArn:event.model.role,
        ModelName:event.name,
        PrimaryContainer:{
            Image:event.images.inference,
            ModelDataUrl:event.params.training.args.ModelArtifacts.S3ModelArtifacts
        },
        Tags:[{
            Key:"BuildStack",
            Value:event.StackName
        }]
    })
}
