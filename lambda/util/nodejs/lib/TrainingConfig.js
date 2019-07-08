var create_image_uri=require('CreateImageURI')
var crypto = require('crypto');
var _=require('lodash')

exports.framework=function(event,name,key){
    var image=create_image_uri[name](event.params)
    var others=_.get(event,"params.hyperparameters",{})
  
    others=_.mapValues(others,x=>`${JSON.stringify(x)}`)
    
    var params=Object.assign({
        sagemaker_container_log_level:event.params.containerloglevel,
        sagemaker_enable_cloudwatch_metrics:event.params.enablecloudwatchmetrics,
        sagemaker_job_name:`"${event.params.name}"`,
        sagemaker_program:`"${event.params.trainentrypoint}"`,
        sagemaker_region:`"${process.env.AWS_REGION}"`,
        sagemaker_submit_directory:`"s3://${event.params.codebucket}/${key}"`,
        checkpoint_path:`"s3://${event.params.checkpointbucket}/${event.params.name}-${event.params.id}/checkpoints"`,
    }, others)

    Hyperparameters=_.mapValues(params,
        x=>typeof x==="string" ? x : JSON.stringify(x)
    )

    return base(event,image,Hyperparameters)
}

exports.amazon=function(event,name){
    var image=create_image_uri.amazon(event.params) 
    return base(event,image,event.params.hyperparameters) 
}

exports.byod=function(event){
    var image=event.params.TrainingImage || `${event.params.accountid}.dkr.ecr.${process.env.AWS_REGION}.amazonaws.com/${event.params.ecrrepo}:Training_v${event.params.version}`

    var hyperparameters=Object.assign({
        sagemaker_job_name:`"${event.params.name}-${event.params.id}"`,
        sagemaker_region:`"${process.env.AWS_REGION}"`,
        checkpoint_path:`"s3://${event.params.checkpointbucket}/${event.params.name}-${event.params.id}/checkpoints"`
    },event.params.hyperparameters)
    
    return base(event,image,hyperparameters)
}

function base(event,image,Hyperparameters={}){
    var name=`${event.params.name}-${event.params.id}`
    if(name.length>63){
        name= crypto.createHash('md5').update(name).digest('hex').slice(0,60);
    }
    return {
      "AlgorithmSpecification": { 
        "TrainingImage":image, 
        "TrainingInputMode":event["params"]["inputmode"],
        MetricDefinitions:_.get(event,"params.metrics",[])
      },
      "InputDataConfig": [ 
        {
          "ChannelName": "training", 
          "DataSource": { 
            "S3DataSource": { 
              "S3DataType": "S3Prefix", 
              "S3Uri":event.params.uri || `s3://${event['params']['databucket']}/train/`, 
              "S3DataDistributionType": "FullyReplicated" 
            }
          },
          "CompressionType": "None",
          "RecordWrapperType": "None" 
        },
      ],
      "OutputDataConfig": { 
        'S3OutputPath':`s3://${event['params']['artifactbucket']}`, 
      },
      "ResourceConfig": { 
        "InstanceCount": event["params"]["traininstancecount"], 
        "InstanceType": event["params"]["traininstancetype"], 
        "VolumeSizeInGB": parseInt(event["params"]["trainvolumesize"]), 
      },
      "RoleArn":event["params"]["trainingrole"], 
      "StoppingCondition": { 
        "MaxRuntimeInSeconds":parseInt(event["params"]["trainmaxrun"])*60*60
      },
      "TrainingJobName":name, 
      "HyperParameters":Hyperparameters,
      "Tags": event.params.Tags || []
    }
}
