var aws=require('aws-sdk')
var response = require('cfn-response')
aws.config.region=process.env.AWS_REGION
var s3=new aws.S3()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    if(event.RequestType==="Delete"){
        new Promise(function(res,rej){
            function next(){
                s3.listObjectVersions({
                    Bucket:params.Bucket,
                    Prefix:params.Prefix
                }).promise()
                .then(x=>x.Versions.concat(x.DeleteMarkers))
                .then(function(files){
                    return files.map(file=>{return {
                        Key:file.Key,
                        VersionId:file.VersionId
                    }  })
                })
                .then(function(keys){
                    if(keys.length>0){ 
                        return s3.deleteObjects({
                            Bucket:params.Bucket,
                            Delete:{
                                Objects:keys
                            }
                        }).promise()
                        .then(()=>next())
                        .catch(rej)
                    }else{
                        res()
                    }
                })
            }
            next()
        })
        .then(()=>response.send(event, context, response.SUCCESS))
        .catch(e=>{
            console.log(e)
            response.send(event, context, response.FAILED)
        })
    }else{
        response.send(event, context, response.SUCCESS)
    }
}   
