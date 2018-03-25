var aws=require('aws-sdk')
var response = require('cfn-response')
aws.config.region=process.env.AWS_REGION
var sagemaker=new aws.SageMaker()
var lambda=new aws.Lambda()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    delete params.ServiceToken
    new Promise(function(res,rej){
        if(event.RequestType==="Wait"){
            sagemaker.describeNotebookInstance({
                NotebookInstanceName:params.NotebookInstanceName
            }).promise()
            .then(function(result){
                if(result.NotebookInstanceStatus==="InService"){
                    response.send(event, context, response.SUCCESS)
                    res()
                }else if(result.NotebookInstanceStatus==="Pending"){
                    setTimeout(()=>{
                        lambda.invoke({
                            FunctionName:process.env.AWS_LAMBDA_FUNCTION_NAME, 
                            InvocationType: "Event", 
                            Payload:JSON.stringify(event), 
                        }).promise()
                        .then(res)
                    },2000)
                }else{
                    rej(result)
                }
            })
        }else if(event.RequestType==="Create"){
            sagemaker.createNotebookInstance(params)
            .promise()
            .then(()=>{
                event.RequestType="Wait"
                setTimeout(()=>{
                    lambda.invoke({
                        FunctionName:process.env.AWS_LAMBDA_FUNCTION_NAME, 
                        InvocationType: "Event", 
                        Payload:JSON.stringify(event), 
                    }).promise()
                    .then(res)
                },2000)
            })
            .catch(rej) 
        }else if(event.RequestType==="Update"){
            sagemaker.updateNotebookInstance({
                NotebookInstanceName:params.NotebookInstanceName,
                InstanceType:params.InstanceType,
                RoleArn:params.RoleArn
            }).promise()
            .then(()=>{
                event.RequestType==="Wait"
                setTimeout(()=>{
                    lambda.invoke({
                        FunctionName:process.env.AWS_LAMBDA_FUNCTION_NAME, 
                        InvocationType: "Event", 
                        Payload:JSON.stringify(event), 
                    }).promise()
                    .then(res)
                },2000)
            })
            .catch(rej)            
        }else{
            sagemaker.describeNotebookInstance({
                NotebookInstanceName:params.NotebookInstanceName
            }).promise()
            .then(function(result){
                if(result.NotebookInstanceStatus==="InService"){
                    return sagemaker.stopNotebookInstance({
                        NotebookInstanceName:params.NotebookInstanceName
                    }).promise()
                    .then(()=>new Promise(function(res,rej){
                        setTimeout(()=>{
                            lambda.invoke({
                                FunctionName:process.env.AWS_LAMBDA_FUNCTION_NAME, 
                                InvocationType: "Event", 
                                Payload:JSON.stringify(event), 
                            }).promise()
                            .then(res)
                        },2000)
                    }))
                    .catch(rej)            
                }else if(result.NotebookInstanceStatus==="Stopped"){
                    return sagemaker.deleteNotebookInstance({
                        NotebookInstanceName:params.NotebookInstanceName
                    }).promise()
                    .then(()=>response.send(event, context, response.SUCCESS))
                    .catch(rej)            
                }else if(result.NotebookInstanceStatus==="Stopping"){
                    setTimeout(()=>{
                        lambda.invoke({
                            FunctionName:process.env.AWS_LAMBDA_FUNCTION_NAME, 
                            InvocationType: "Event", 
                            Payload:JSON.stringify(event), 
                        }).promise()
                        .then(()=>{
                            res()
                        })
                    },2000)
                }else{
                    rej(result) 
                }
            })
        }
    })
    .then(()=>callback(null))
    .catch(x=>{
        console.log(x)
        response.send(event, context, response.FAILED)
        callback(null)
    })
}

