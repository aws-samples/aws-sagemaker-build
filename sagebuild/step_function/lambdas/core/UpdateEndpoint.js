var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var sagemaker=new aws.SageMaker()
var crypto=require('crypto')
var hash=crypto.randomBytes(8).toString('base64').replace('=','')

exports.handler=(event,context,cb)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
    
    return sagemaker.describeEndpoint({
        EndpointName:event.params.stackname
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
                EndpointConfigName:event.params.name,
                EndpointName:event.params.stackname
            }).promise()
        }else{
            return sagemaker.createEndpoint({
                EndpointConfigName:event.params.name,
                EndpointName:event.params.stackname
            }).promise()
        }
    })
    .then(result=>{
        cb(null,result)
    })
    .catch(x=>cb(new Error(x)))
}
