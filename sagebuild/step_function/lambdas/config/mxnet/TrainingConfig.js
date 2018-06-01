exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    callback(null,{
      "AlgorithmSpecification": { 
        "TrainingImage":event["images"]["train"], 
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
        "VolumeSizeInGB":parseInt(process.env.TRAINVOLUMNSIZE), 
      },
      "RoleArn":event["params"]["training"]["role"], 
      "StoppingCondition": { 
        "MaxRuntimeInSeconds": 86400
      },
      "TrainingJobName":event["name"], 
      "HyperParameters": Object.assign({
            sagemaker_container_log_level:process.env.CONTAINERLOGLEVEL,
            sagemaker_enable_cloudwatch_metrics:process.env.CONTAINERLOGLEVEL,
            sagemaker_job_name:`"${event["name"]}"`,
            sagemaker_program:`"${process.env.TRAINENTRYPOINT}"`,
            sagemaker_region:`"${process.env.AWS_REGION}"`,
            sagemaker_submit_directory:`"${process.env.TRAINSOURCEFILE}"`,
        },process.env.HYPERPARAMETERS || {}),
      "Tags": []
    })
}

function create_image_uri(){
    var account='520713654638'
    var instance=process.env.TRAININSTANCETYPE.split('.')[1][0]==="p" ? "gpu" : "cpu"
    return `${account}.dkr.ecr.${process.env.AWS_REGION}.amazonaws.com/sagemaker-tensorflow:${process.env.FRAMEWORKVERSION}-${instance}-${process.env.PYVERSION}`
}
