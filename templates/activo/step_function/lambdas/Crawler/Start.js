var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var glue=new aws.Glue()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    try{
        glue.startCrawler({
            Name:event.Crawler
        }).promise()
        .then(result=>{
            result.retry=false
            callback(null,result)
        })
        .catch(error=>callback(new Error(error)))
    }catch(error){
        callback(new Error(error))
    }
}   
