var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var sagemaker=new aws.SageMaker()

exports.handler=(event,context,cb)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
    
    
    sagemaker.describeTrainingJob({
        TrainingJobName:event.params.training.args.TrainingJobName
    }).promise()
    .then(result=>{
        Object.assign(event.params.training.args,result)
        cb(null,event)
    })
    .catch(cb)
}
