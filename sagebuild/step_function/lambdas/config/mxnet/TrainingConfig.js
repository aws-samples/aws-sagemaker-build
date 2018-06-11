exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    var Hyperparameters=Object.assign({
        sagemaker_container_log_level:event.params.containerloglevel,
        sagemaker_enable_cloudwatch_metrics:event.params.enablecloudwatchmetrics,
        sagemaker_job_name:`"${event.params.name}"`,
        sagemaker_program:`"${event.params.trainentrypoint}"`,
        sagemaker_region:`"${process.env.AWS_REGION}"`,
        sagemaker_submit_directory:`"${event.params.trainsourcefile}"`,
    },JSON.parse(event.params.hyperparameters || "{}"))

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
      "TrainingJobName":event.params.name, 
      "HyperParameters":Hyperparameters,
      "Tags": []
    })
}

function create_image_uri(params){
    var account='520713654638'
    var instance=params.traininstancetype.split('.')[1][0]==="p" ? "gpu" : "cpu"
    return `${account}.dkr.ecr.${process.env.AWS_REGION}.amazonaws.com/sagemaker-mxnet:${params.mxnetversion}-${instance}-${params.pyversion}`
}
