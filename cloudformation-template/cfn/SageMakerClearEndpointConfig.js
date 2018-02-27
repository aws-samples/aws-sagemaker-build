var aws=require('aws-sdk')
var response = require('cfn-response')
aws.config.region=process.env.AWS_REGION
var lambda=new aws.Lambda()
var sagemaker=new aws.SageMaker()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    if(event.RequestType==="Delete"){
        sagemaker.listEndpointConfigs({
            NameContains:event.name,
            NextToken:event.NextToken
        }).promise()
        .then(result=>{
            if(result.EndpointConfigs.length){
                event.NextToken=result.NextToken
                return new Promise(function(res,rej){
                    next(0)
                    function next(index){
                        var item=result.EndpointConfigs[index]
                        if(item){
                            sagemaker.deleteEndpointConfig({
                                EndpointConfigName:item.EndpointConfigName
                            }).promise()
                            .then(x=>next(index-1))
                            .catch(rej)
                        }else{
                            res()
                        }
                    }
                })
                .then(()=>lambda.invoke({
                    FunctionName:process.env.AWS_LAMBDA_FUNCTION_NAME, 
                    InvocationType: "Event", 
                    Payload:JSON.stringify(event), 
                }).promise())
            }else{
                response.send(event, context, response.SUCCESS)
            }
        })
        .catch(error=>{
            console.log(error)
            response.send(event, context, response.FAILED)
        })
    }else{
        response.send(event, context, response.SUCCESS)    
    }
}

