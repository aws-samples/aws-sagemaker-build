var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var step=new aws.StepFunctions()

exports.handler=(event,context,cb)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))

    step.describeExecution({
        executionArn:event.outputs.PostProcess.executionArn
    }).promise()
    .then(result=>cb(null,{"status":result.status}))
    .catch(x=>cb(new Error(x)))
}
