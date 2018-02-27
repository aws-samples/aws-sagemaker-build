var aws=require('aws-sdk')
var response = require('cfn-response')
aws.config.region=process.env.AWS_REGION
var sagemaker=new aws.SageMaker()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    if(event.RequestType==="Delete"){
        sagemaker.deleteEndpoint({
            EndpointName:event.ResourceProperties.name
        }).promise()
        .then(()=>response.send(event, context, response.SUCCESS))
        .catch(x=>{
            console.log(x)
            response.send(event, context, response.SUCCESS)
        })
    }else{
        response.send(event, context, response.SUCCESS)
    }
}

