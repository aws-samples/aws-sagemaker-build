var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var s3=new aws.S3()
var config=require('TrainingConfig')

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var key= `versions/training/v${event.params.version}.tar.gz`
    try{
        s3.copyObject({
            CopySource:event.params.trainsourcefile.match(/s3:\/\/(.*)/)[1],
            Bucket:event.params.codebucket,
            Key:key
        }).promise()
        .then(function(){
            callback(null,config.framework(event,"scikit",key))
        })
        .catch(x=>callback(new Error(x)))
    }catch(e){
        callback(new Error(e))
    }
}

