var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var sns=new aws.SNS()
var result="Failed"
exports.handler=(event,context,cb)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
  
    sns.publish({
        TopicArn:event.SNSTopic,
        Subject:`SageBuild ${result}`,
        Message:`Training ${result}. 
            StackName:${event.StackName} 
            Name:${event.name}
            Date:${new Date()}
        `,
        MessageAttributes:{
            event:{
                DataType:"String",
                StringValue:JSON.stringify(event)
            }
        }
    }).promise()
    .then(result=>{
        cb(null,{})
    })
    .catch(cb)
}
