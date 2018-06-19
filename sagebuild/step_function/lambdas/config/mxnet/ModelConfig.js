var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var sagemaker=new aws.SageMaker()
var s3=new aws.S3()

exports.handler=(event,context,callback)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
    
    var key= `versions/inference/v${event.params.version}.tar.gz`
    s3.copyObject({
        CopySource:event.params.hostsourcefile.match(/s3:\/\/(.*)/)[1],
        Bucket:event.params.codebucket,
        Key:key
    }).promise()
    .then(function(){
        callback(null,{
            ExecutionRoleArn:event.params.modelrole,
            ModelName:`${event.params.name}-${event.params.id}`,
            PrimaryContainer:{
                Image:create_image_uri(event.params),
                ModelDataUrl:event.status.training.ModelArtifacts.S3ModelArtifacts,
                Environment:Object.assign({
                    SAGEMAKER_CONTAINER_LOG_LEVEL:event.params.containerloglevel,
                    SAGEMAKER_ENABLE_CLOUDWATCH_METRICS:event.params.enablecloudwatchmetrics,
                    SAGEMAKER_PROGRAM:`${event.params.hostentrypoint}`,
                    SAGEMAKER_REGION:`${process.env.AWS_REGION}`,
                    SAGEMAKER_SUBMIT_DIRECTORY:`s3://${event.params.codebucket}/${key}`,
                },event.params.modelhostingenvironment || {})
            },
            Tags:[{
                Key:"sagebuild:stack",
                Value:event.params.stackname
            }]
        })
    })
    .catch(x=>callback(new Error(x)))
}

function create_image_uri(params){
    var account='520713654638'
    var instance=params.traininstancetype.split('.')[1][0]==="p" ? "gpu" : "cpu"
    return `${account}.dkr.ecr.${process.env.AWS_REGION}.amazonaws.com/sagemaker-mxnet:${params.mxnetversion}-${instance}-${params.pyversion}`
}
