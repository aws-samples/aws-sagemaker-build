var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var sagemaker=new aws.SageMaker()
var crypto=require('crypto')
var hash=crypto.randomBytes(8).toString('base64').replace('=','')

exports.handler=(event,context,cb)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
    
    return sagemaker.deleteEndpoint({
        EndpointName:event.params.endpointname
    }).promise()
    .then(result=>{
        cb(null,result)
    })
    .catch(x=>cb(new Error(x)))
}
