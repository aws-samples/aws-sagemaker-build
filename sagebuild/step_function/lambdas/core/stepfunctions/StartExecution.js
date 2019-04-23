var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var step=new aws.StepFunctions()

exports.handler=(event,context,cb)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))

    step.startExecution({
        stateMachineArn:event.params.ETLStepFuction,
        input:JSON.stringify(event.params)
    }).promise()
    .then(result=>cb(null,result))
    .catch(x=>cb(new Error(x)))
}
