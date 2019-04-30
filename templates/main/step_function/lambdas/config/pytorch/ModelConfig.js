var config=require('ModelConfig').framework

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var key= `versions/inference/v${event.params.version}.tar.gz`

    try{
        s3.copyObject({
            CopySource:event.params.hostsourcefile.match(/s3:\/\/(.*)/)[1],
            Bucket:event.params.codebucket,
            Key:key
        }).promise()
        .then(function(){
            callback(null,config(event,"pytorch",key))
        })
        .catch(x=>callback(new Error(x)))

    }catch(e){
        callback(new Error(e))
    }
}

