exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    var Hyperparameters=Object.assign({
        sagemaker_container_log_level:process.env.CONTAINERLOGLEVEL,
        sagemaker_enable_cloudwatch_metrics:process.env.ENABLECLOUDWATCHMETRICS,
        sagemaker_job_name:`"${event["name"]}"`,
        sagemaker_program:`"${process.env.TRAINENTRYPOINT}"`,
        sagemaker_region:`"${process.env.AWS_REGION}"`,
        sagemaker_submit_directory:`"${process.env.TRAINSOURCEFILE}"`,
    },JSON.parse(process.env.HYPERPARAMETERS || "{}"))

    Object.keys(Hyperparameters).forEach(x=>{
        var value=Hyperparameters[x]
        Hyperparameters[x]= typeof value==="string" ? value : JSON.stringify(value)
    })
    callback(null,{
      "AlgorithmSpecification": { 
        "TrainingImage":create_image_uri(), 
        "TrainingInputMode":process.env.INPUTMODE
      },
      "InputDataConfig": [ 
        {
          "ChannelName": "train", 
          "DataSource": { 
            "S3DataSource": { 
              "S3DataType": "S3Prefix", 
              "S3Uri":`s3://${event.Buckets.Data}/train/`, 
              "S3DataDistributionType": "ShardedByS3Key" 
            }
          },
          "CompressionType": "None",
          "RecordWrapperType": "None" 
        },
      ],
      "OutputDataConfig": { 
        'S3OutputPath':`s3://${event['Buckets']['Artifact']}`, 
      },
      "ResourceConfig": { 
        "InstanceCount": process.env.TRAININSTANCECOUNT, 
        "InstanceType": process.env.TRAININSTANCETYPE, 
        "VolumeSizeInGB":parseInt(process.env.TRAINVOLUMESIZE), 
      },
      "RoleArn":event["params"]["training"]["role"], 
      "StoppingCondition": { 
        "MaxRuntimeInSeconds":parseInt(process.env.TRAINMAXRUN)*60*60
      },
      "TrainingJobName":event["name"], 
      "HyperParameters":Hyperparameters,
      "Tags": []
    })
}

function create_image_uri(){
    var account='520713654638'
    var instance=process.env.TRAININSTANCETYPE.split('.')[1][0]==="p" ? "gpu" : "cpu"
    return `${account}.dkr.ecr.${process.env.AWS_REGION}.amazonaws.com/sagemaker-mxnet:${process.env.MXNETVERSION}-${instance}-${process.env.PYVERSION}`
}
