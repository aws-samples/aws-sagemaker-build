var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var sagemaker=new aws.SageMaker()

exports.handler=(event,context,cb)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
    
    
    sagemaker.describeEndpoint({
        EndpointName:event.endpoint.name
    }).promise()
    .then(result=>{
        Object.assign(event.endpoint,result)
        cb(null,event)
    })
    .catch(cb)
}
