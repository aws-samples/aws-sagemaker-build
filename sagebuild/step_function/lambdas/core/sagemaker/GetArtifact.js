var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var sagemaker=new aws.SageMaker()

exports.handler=(event,context,cb)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
    var model=event.params.models[0]
    sagemaker.describeModel({
        ModelName:model
    }).promise()
    .then(result=>{
        event.status.training={
            ModelArtifacts:{
                S3ModelArtifacts:result.PrimaryContainer.ModelDataUrl
            }
        }
    })
    sagemaker.createModel(event.args.model).promise()
    .then(result=>{
        cb(null,result)
    })
    .catch(x=>cb(new Error(x)))
}
