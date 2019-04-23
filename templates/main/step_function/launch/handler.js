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
            var message=JSON.parse(event.Records[0].Sns.Message)
            if(message.Records){  
                var record=message.Records[0]
                if(record.codecommit){
                    var source="aws:codecommit"
                }else if(record.s3){
                    var source=record.eventSource
                }else{
                    var source="custom"
                }
            }else{
                var record=message
                var source="custom" 
            }
            if(message.build){
                var build=message.build
            }else{
                var build={
                    Inference:!["MXNET","TENSORFLOW","AMAZON"]
                        .includes(process.env.CONFIG_FRAMEWORK),
                    Training:!["MXNET","TENSORFLOW","AMAZON"]
                        .includes(process.env.CONFIG_FRAMEWORK)
                }
            }
            switch(source){
                case "custom":
                    var input={
                        original:message,
                        train:typeof(record.train) != "undefined" ? message.train : true,
                        build
                    }
                    break;
                case "aws:s3":
                case "aws:codecommit":
                    var input={
                        build,
                        train:true
                    }
                    break;
            }
            var param={
                stateMachineArn:process.env.STATE_MACHINE,
                name:`SNS-${event.Records[0].Sns.MessageId}`,
                input:typeof input === "string" ? input : JSON.stringify(input)
            }
            console.log(JSON.stringify(param),null,2)
            return stepfunctions.startExecution(param).promise()
        }
    })
    .then(()=>callback(null))
}
