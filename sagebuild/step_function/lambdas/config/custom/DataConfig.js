var aws=require('aws-sdk')
var s3=new aws.S3()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))

    s3.getBucketTagging({
        Bucket:event.Buckets.Data
    }).promise()
    .then(function(result){
        console.log(result)
        var out=result.TagSet
            .filter(x=>x.Key.match(/sagebuild:channel:(.*)/))
            .map(x=>[x.Key.match(/sagebuild:channel:(.*)/)[1],x.Value])
            .map(x=>{return {
                  "ChannelName":x[0], 
                  "DataSource": { 
                    "S3DataSource": { 
                      "S3DataType": "S3Prefix", 
                      "S3Uri":`s3://${event.Buckets.Data}/${x[1]}`, 
                      "S3DataDistributionType": "ShardedByS3Key" 
                    }
                  },
                  "CompressionType": "None",
                  "RecordWrapperType": "None" 
            }})
        console.log(out)
        callback(null,out)
    })
    .catch(callback)
}
