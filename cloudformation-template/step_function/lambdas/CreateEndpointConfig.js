var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var sagemaker=new aws.SageMaker()

exports.handler=(event,context,cb)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
    
    var args=Object.assign({
        EndpointConfigName:event.name
    },event.params.endpoint.args) 

    sagemaker.createEndpointConfig(args).promise()
    .then(result=>{
        event.params.endpoint.arn=result.EndpointConfigArn
        cb(null,event.endpoint)
    })
    .catch(x=>cb(new Error(x)))
}
