var aws=require('aws-sdk')
var response = require('cfn-response')
aws.config.region=process.env.AWS_REGION
var s3=new aws.S3()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    if(event.RequestType!=="Delete"){
        s3.headObject({
            Bucket:params.Bucket,
            Key:params.Key
        }).promise()
        .then(result=>response.send(event, context, response.SUCCESS,{},result.VersionId))
        .catch(error=>{
            console.log(error)
            response.send(event, context, response.FAILED)
        })
    }else{
        response.send(event, context, response.SUCCESS)
    }
}



