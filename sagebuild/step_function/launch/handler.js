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
                    var source=custom
                }
            }else{
                var source="custom" 
            }
            
            switch(source){
                case "custom":
                    var input={
                        original:message,
                        train:message.train || true ,
                        build:!["MXNET","TENSORFLOW"].includes(process.env.CONFIG_PRESET)
                    }
                    break;
                case "aws:s3":
                    var bucket=record.s3.bucket.name
                    if(bucket===process.env.DATA_BUCKET){
                        var input={
                            train:true
                        }
                    }else if(bucket===process.env.CODE_BUCKET){
                        if(["MXNET","TENSORFLOW"].includes(process.env.CONFIG_PRESET)){
                            var input={
                                train:true
                            }
                        }else{
                            var input={
                                build:true,
                                train:true
                            }
                        }
                    }else{
                        var input=message
                    }
                    break;
                case "aws:codecommit":
                    var input={
                        train:true,
                        build:true
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
