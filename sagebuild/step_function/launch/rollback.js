var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var sagemaker=new aws.SageMaker()

exports.handler=(event,context,cb)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
    
    return sagemaker.describeEndpoint({
        EndpointName:process.env.ENDPOINT
    }).promise()
    .then(function(result){
        var config=result.EndpointConfigName
        return sagemaker.describeEndpointConfig({
            EndpointConfigName:config
        }).promise()
    })
    .then(function(result){
        return sagemaker.listTags({
            ResourceArn:result.EndpointConfigArn
        }).promise()
    })
    .then(function(result){
        previous=result.Tags.filter(x=>x.Key="sagebuild:previous")[0].Value
        return sagemaker.updateEndpoint({
            EndpointConfigName:previous,
            EndpointName:process.env.ENDPOINT
        }).promise()
    })
    .then(console.log)
    .then(()=>cb(null))
    .catch(x=>cb(new Error(x)))
}
