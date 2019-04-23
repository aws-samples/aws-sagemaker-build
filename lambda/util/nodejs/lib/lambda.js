var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var response = require('cfn-response')
var lambda=new aws.Lambda()
var sagemaker=new aws.SageMaker()
var step=new aws.StepFunctions()

exports.validate=result=>{
    console.log(JSON.stringify(result,null,2))
    if(result.FunctionError){
        throw JSON.parse(JSON.parse(result.Payload).errorMessage)
    }else{
        return JSON.parse(result.Payload)
    }
}

exports.val=result=>{
    console.log(JSON.stringify(result,null,2))
    if(result.FunctionError){
        throw JSON.parse(result.Payload)
    }else{
        return JSON.parse(result.Payload)
    }
}
exports.recurse=(event,context,callback)=>{
    setTimeout(()=>lambda.invoke({
            FunctionName:process.env.AWS_LAMBDA_FUNCTION_NAME,
            InvocationType:"Event",
            Payload:JSON.stringify(event)
        }).promise()
        .catch(error=>{
            console.log(error)
            response.send(event, context, response.FAILED)
        })
        .then(()=>callback(null))
    ,5000)
}

exports.cfn=function(responseBody,URL) {
    console.log("Response body:\n", responseBody);
 
    var https = require("https");
    var url = require("url");
 
    var parsedUrl = url.parse(URL);
    var options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.path,
        method: "PUT",
        headers: {
            "content-type": "",
            "content-length": responseBody.length
        }
    };

    return new Promise(function(res,rej){ 
        var request = https.request(options, function(response) {
            console.log("Status code: " + response.statusCode);
            console.log("Status message: " + response.statusMessage);
            res()
        });
     
        request.on("error", function(error) {
            console.log("send(..) failed executing https.request(..): " + error);
            rej(erroir)
        });
     
        request.write(responseBody);
        request.end();
    })
}
