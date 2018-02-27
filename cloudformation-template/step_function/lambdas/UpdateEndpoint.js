var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var sagemaker=new aws.SageMaker()
var crypto=require('crypto')
var hash=crypto.randomBytes(8).toString('base64').replace('=','')

exports.handler=(event,context,cb)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
    
    return sagemaker.describeEndpoint({
        EndpointName:event.StackName
    }).promise()
    .then(()=>true)
    .catch(error=>{
        if(error.message.match(/Could not find/)){
            return false
        }else{
            throw error
        }
    })
    .then(function(exists){
        if(exists){
            return sagemaker.updateEndpoint({
                EndpointConfigName:event.name,
                EndpointName:event.StackName
            }).promise()
        }else{
            return sagemaker.createEndpoint({
                EndpointConfigName:event.name,
                EndpointName:event.StackName
            }).promise()
        }
    })
    .then(result=>{
        event.endpoint.name=event.StackName
        cb(null,event)
    })
    .catch(x=>cb(new Error(x)))
}
