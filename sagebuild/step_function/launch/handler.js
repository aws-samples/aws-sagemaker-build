var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var stepfunctions=new aws.StepFunctions()

exports.handler=function(event,context,callback){
    console.log('Request:',JSON.stringify(event,null,2))
    stepfunctions.listExecutions({
        stateMachineArn:process.env.STATE_MACHINE,
        statusFilter:"RUNNING" 
    }).promise()
    .then(result=>{
        if(result.executions.length===0){
            return stepfunctions.startExecution({
                stateMachineArn:process.env.STATE_MACHINE,
                name:`SNS-${event.Records[0].Sns.MessageId}`
            }).promise()
        }
    })
    .then(()=>callback(null))
}
