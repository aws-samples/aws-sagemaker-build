exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    callback(null,{
      "AlgorithmSpecification": { 
        "TrainingImage":create_image_uri(), 
        "TrainingInputMode": "File"
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
      "ResourceConfig":{ 
        "InstanceCount": process.env.TRAINGINSTANCECOUNT, 
        "InstanceType": process.env.TRAININSTANCETYPE, 
        "VolumeSizeInGB": parseInt(process.env.TRAINVOLUMESIZE), 
      },
      "RoleArn":event["params"]["training"]["role"], 
      "StoppingCondition": { 
        "MaxRuntimeInSeconds":parseInt(process.env.TRAINMAXRUN)*60*60
      },
      "TrainingJobName":event["name"], 
      "HyperParameters": Object.assign({
        sagemaker_container_log_level:"20",
        sagemaker_enable_cloudwatch_metrics:"false",
        sagemaker_job_name:`"${event["name"]}"`,
        sagemaker_program:`"${process.env.TRAINENTRYPOINT}"`,
        sagemaker_region:`"${process.env.AWS_REGION}"`,
        sagemaker_submit_directory:`"${process.env.HOSTSOURCEFILE}"`,
        checkpoint_path:`"s3://${process.env.CHECKPOINTBUCKET}/${event["name"]}"`,
        evaluation_steps:process.env.EVALUATIONSTEPS,
        training_steps:process.env.TRAININGSTEPS,
      },JSON.parse(process.env.HYPERPARAMETERS || "{}")),
      "Tags": []
    })
}

function create_image_uri(){
    var account='520713654638'
    var instance=process.env.TRAININSTANCETYPE.split('.')[1][0]==="p" ? "gpu" : "cpu"
    return `${account}.dkr.ecr.${process.env.AWS_REGION}.amazonaws.com/sagemaker-tensorflow:${process.env.TENSORFLOWVERSION}-${instance}-${process.env.PYVERSION}`
}
