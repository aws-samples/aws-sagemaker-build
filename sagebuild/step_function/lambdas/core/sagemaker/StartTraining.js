var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var sagemaker=new aws.SageMaker()

exports.handler=(event,context,cb)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
    event.args.training.Tags=event.args.training.Tags || []
    event.args.training.Tags.push({
        Key:"sagebuild:BuildStack",
        Value:event.params.stackname
    })
    sagemaker.createTrainingJob(event.args.training).promise()
    .then(result=>cb(null,result))
    .catch(x=>cb(new Error(x)))
}
