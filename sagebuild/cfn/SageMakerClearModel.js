var aws=require('aws-sdk')
var response = require('cfn-response')
aws.config.region=process.env.AWS_REGION
var lambda=new aws.Lambda()
var sagemaker=new aws.SageMaker()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    if(event.RequestType==="Delete"){
        sagemaker.listModels({
            NameContains:event.name,
            NextToken:event.NextToken
        }).promise()
        .then(result=>{
            if(result.Models.length){
                event.NextToken=result.NextToken
                return new Promise(function(res,rej){
                    next(0)
                    function next(index){
                        var item=result.Models[index]
                        if(item){
                            sagemaker.deleteModel({
                                ModelName:item.ModelName
                            }).promise()
                            .then(x=>next(index-1))
                            .catch(error=>{
                                if(error.code==="ThrottlingException"){
                                    setTimeout(()=>next(index),2000)
                                }else{
                                    rej(error)
                                }
                            })
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
                .catch(function(err){
                    if(err.code==="ThrottlingException"){
                        setTimeout(()=>next(index),1000)
                    }else{
                        rej(err) 
                    }
                })
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

