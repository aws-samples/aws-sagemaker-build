var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var s3=new aws.S3()
var create_image_uri=require('CreateImageURI').mxnet

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var key= `versions/training/v${event.params.version}.tar.gz`
    try{
        s3.copyObject({
            CopySource:event.params.trainsourcefile.match(/s3:\/\/(.*)/)[1],
            Bucket:event.params.codebucket,
            Key:key
        }).promise()
        .then(function(){
            var others=event.params.hyperparameters || {} 
            Object.keys(others).forEach(function(key){
                others[key]=`${JSON.stringify(others[key])}` 
            })
            var Hyperparameters=Object.assign({
                sagemaker_container_log_level:event.params.containerloglevel,
                sagemaker_enable_cloudwatch_metrics:event.params.enablecloudwatchmetrics,
                sagemaker_job_name:`"${event.params.name}"`,
                sagemaker_program:`"${event.params.trainentrypoint}"`,
                sagemaker_region:`"${process.env.AWS_REGION}"`,
                sagemaker_submit_directory:`"s3://${event.params.codebucket}/${key}"`,
                checkpoint_path:`"s3://${event.params.checkpointbucket}/${event.params.name}-${event.params.id}/checkpoints"`,
            }, others)

            Object.keys(Hyperparameters).forEach(x=>{
                var value=Hyperparameters[x]
                Hyperparameters[x]= typeof value==="string" ? value : JSON.stringify(value)
            })
            callback(null,{
              "AlgorithmSpecification": { 
                "TrainingImage":create_image_uri(event.params), 
                "TrainingInputMode":event.params.inputmode
              },
              "OutputDataConfig": { 
                'S3OutputPath':`s3://${event.params.artifactbucket}`, 
              },
              "ResourceConfig": { 
                "InstanceCount": event.params.traininstancecount, 
                "InstanceType": event.params.traininstancetype, 
                "VolumeSizeInGB":parseInt(event.params.trainvolumesize), 
              },
              "RoleArn":event["params"]["trainingrole"], 
              "StoppingCondition": { 
                "MaxRuntimeInSeconds":parseInt(event.params.trainmaxrun)*60*60
              },
              "TrainingJobName":`${event.params.name}-${event.params.id}`, 
              "HyperParameters":Hyperparameters,
              "Tags": []
            })
        })
        .catch(x=>callback(new Error(x)))
    }catch(e){
        callback(new Error(e))
    }
}


