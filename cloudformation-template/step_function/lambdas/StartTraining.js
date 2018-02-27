var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var sagemaker=new aws.SageMaker()

exports.handler=(event,context,cb)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
    event.Tags=event.Tags || []
    event.Tags.push({
        Key:"BuildStack",
        Value:event.StackName
    })
    
    sagemaker.createTrainingJob(event.params.training.args).promise()
    .then(result=>cb(null,result.TrainingJobArn))
    .catch(cb)
}
