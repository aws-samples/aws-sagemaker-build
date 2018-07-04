var aws=require('aws-sdk')
var s3=new aws.S3()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    try{
        var channels=event.params.channels
        var out=Object.keys(channels).map(function(key){
            return {
              "ChannelName":key, 
              "DataSource": { 
                "S3DataSource": { 
                  "S3DataType": "S3Prefix", 
                  "S3Uri":`s3://${event.params.databucket}/${channels[key].path}`, 
                  "S3DataDistributionType": channels[key].dist ? "ShardedByS3Key"  : "FullyReplicated"
                }
              },
              "CompressionType": "None",
              "RecordWrapperType": "None" 
            }
        })
        
        callback(null,out)
    }catch(e){
        console.log(e)
        callback(new Error(e))
    }
}
