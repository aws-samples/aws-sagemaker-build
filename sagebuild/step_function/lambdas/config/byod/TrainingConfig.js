var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    try{
        image=event.params.TrainingImage || `${event.params.accountid}.dkr.ecr.${process.env.AWS_REGION}.amazonaws.com/${event.params.ecrrepo}:Training_v${event.params.version}`

        var Hyperparameters=Object.assign({
            sagemaker_job_name:`"${event.params.name}-${event.params.id}"`,
            sagemaker_region:`"${process.env.AWS_REGION}"`,
            checkpoint_path:`"s3://${event.params.checkpointbucket}/${event.params.name}-${event.params.id}/checkpoints"`,
        },event.params.hyperparameters)

        callback(null,{
          "AlgorithmSpecification": { 
            "TrainingImage":image, 
            "TrainingInputMode":event["params"]["inputmode"]
          },
          "InputDataConfig": [ 
            {
              "ChannelName": "training", 
              "DataSource": { 
                "S3DataSource": { 
                  "S3DataType": "S3Prefix", 
                  "S3Uri":`s3://${event['params']['databucket']}/train/`, 
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
          "TrainingJobName":`${event.params.name}-${event.params.id}`, 
          "HyperParameters":Hyperparameters,
          "Tags": []
        })
    }catch(e){
        callback(new Error(e))
    }
}
