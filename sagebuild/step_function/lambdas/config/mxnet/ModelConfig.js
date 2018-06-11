var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var sagemaker=new aws.SageMaker()

exports.handler=(event,context,callback)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
    callback(null,{
        ExecutionRoleArn:event.params.modelrole,
        ModelName:event.params.name,
        PrimaryContainer:{
            Image:create_image_uri(),
            ModelDataUrl:event.status.training.ModelArtifacts.S3ModelArtifacts,
            Environment:{
                SAGEMAKER_CONTAINER_LOG_LEVEL:event.params.containerloglevel,
                SAGEMAKER_ENABLE_CLOUDWATCH_METRICS:event.params.enablecloudwatchmetrics,
                SAGEMAKER_PROGRAM:`${event.params.hostentrypoint}`,
                SAGEMAKER_REGION:`${process.env.AWS_REGION}`,
                SAGEMAKER_SUBMIT_DIRECTORY:`${event.params.hostsourcefile}`,
            }
        },
        Tags:[{
            Key:"sagebuild:stack",
            Value:event.params.stackname
        }]
    })
}

function create_image_uri(){
    var account='520713654638'
    var instance=process.env.TRAININSTANCETYPE.split('.')[1][0]==="p" ? "gpu" : "cpu"
    return `${account}.dkr.ecr.${process.env.AWS_REGION}.amazonaws.com/sagemaker-mxnet:${process.env.MXNETVERSION}-${instance}-${process.env.PYVERSION}`
}
