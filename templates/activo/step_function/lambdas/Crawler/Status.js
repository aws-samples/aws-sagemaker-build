var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var glue=new aws.Glue()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    try{
        glue.getCrawler({
            Name:event.params.Crawler
        }).promise()
        .then(result=>{
            var out=result.Crawler
            out.finished=(out.State==="READY")
            callback(null,out)
        })
        .catch(error=>callback(new Error(error)))
    }catch(error){
        callback(new Error(error))
    }
}   
