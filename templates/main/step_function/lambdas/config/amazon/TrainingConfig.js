var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var create_image_uri=require('CreateImageURI').amazon
var s3=new aws.S3()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    try{
        var Hyperparameters=event.params.hyperparameters

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
    }catch(e){
        callback(new Error(e))
    }
}
