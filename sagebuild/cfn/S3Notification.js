var aws=require('aws-sdk')
var response = require('cfn-response')
aws.config.region=process.env.AWS_REGION
var s3=new aws.S3()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    delete params.ServiceToken
    
    if(event.RequestType!=="Delete"){
        s3.putBucketNotificationConfiguration(params).promise()
        .then(()=>response.send(event, context, response.SUCCESS))
        .catch(e=>{
            console.log(e)
            response.send(event, context, response.FAILED)
        })
    }else{
        response.send(event, context, response.SUCCESS)
    }
}

