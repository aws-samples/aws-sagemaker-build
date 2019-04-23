var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var lambda=new aws.Lambda()

exports.query=function(gremlin){
    return lambda.invoke({
        FunctionName:process.env.PROXY_GREMLIN,
        InvocationType:"RequestResponse",
        Payload:JSON.stringify({
            "gremlin":gremlin
        })
    }).promise()
    .then(response=>{
        console.log(JSON.stringify(response,null,2))
        if(response.FunctionError){
            throw response.FunctionError
        }else{
            return JSON.parse(response.Payload.toString())
        }
    })
}
