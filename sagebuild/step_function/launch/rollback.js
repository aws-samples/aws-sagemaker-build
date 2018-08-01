var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var sagemaker=new aws.SageMaker()

exports.handler=(event,context,cb)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
    
    return sagemaker.describeEndpoint({
        EndpointName:process.env.ENDPOINT
    }).promise()
    .then(function(result){
        //get endpoint config
    })
    .then(function(result){
        return sagemaker.updateEndpoint({
            EndpointConfigName://prev tag,
            EndpointName:process.env.ENDPOINT
        }).promise()
    })
    .then(()=>cb(null))
    .catch(x=>cb(new Error(x)))
}
