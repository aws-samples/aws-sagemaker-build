var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var sns=new aws.SNS()
var ssm=new aws.SSM()

var result="Success"
exports.handler=(event,context,cb)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
  
    Promise.all([
        sns.publish({
            TopicArn:event.params.statustopic,
            Subject:`SageBuild ${result}`,
            Message:`Training ${result}. 
                StackName:${event.params.stackname} 
                Name:${event.params.name}
                Date:${new Date()}
            `,
            MessageAttributes:{
                event:{
                    DataType:"String",
                    StringValue:JSON.stringify(event)
                }
            }
        }).promise(),
        ssm.putParameter({
            Name:process.env.VERSIONPARAMETERSTORE,
            Type:"String",
            Value:JSON.stringify({
                version_number:event.params.version,
                model_name:`${event.params.name}-${event.params.id}`
            }),
            Overwrite:true
        }).promise()
    ])
    .then(result=>{
        cb(null,{})
    })
    .catch(cb)
}
