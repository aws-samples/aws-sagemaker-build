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
            ModelDataUrl:event.params.training.args.ModelArtifacts.S3ModelArtifacts,
            Environment:{
                SAGEMAKER_CONTAINER_LOG_LEVEL:process.env.CONTAINERLOGLEVEL,
                SAGEMAKER_ENABLE_CLOUDWATCH_METRICS:process.env.ENABLECLOUDWATCHMETRICS,
                SAGEMAKER_PROGRAM:`${process.env.HOSTENTRYPOINT}`,
                SAGEMAKER_REGION:`${process.env.AWS_REGION}`,
                SAGEMAKER_SUBMIT_DIRECTORY:`${process.env.HOSTSOURCEFILE}`,
            }
        },
        Tags:[{
            Key:"BuildStack",
            Value:event.StackName
        }]
    })
}

function create_image_uri(){
    var account='520713654638'
    var instance=process.env.TRAININSTANCETYPE.split('.')[1][0]==="p" ? "gpu" : "cpu"
    return `${account}.dkr.ecr.${process.env.AWS_REGION}.amazonaws.com/sagemaker-tensorflow:${process.env.FRAMEWORKVERSION}-${instance}-${process.env.PYVERSION}`
}
