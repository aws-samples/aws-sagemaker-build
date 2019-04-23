var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var comprehend = new aws.Comprehend();
var s3=new aws.S3()
var tar = require('tar-stream')
var _=require('lodash')
var zlib = require('zlib');

exports.extract=function(event,result){
    var gzip = zlib.createGunzip();
    var extract = tar.extract()
    var wait=[]
    return new Promise((res,rej)=>{
        extract.on('entry',(header, stream, next)=>{
            console.log(header)
            if(header.type==="file"){
                var param={
                    Bucket:event.params.result.Bucket,
                    Key:`${event.params.result.Key}-${header.name.split('.')[0]}`,
                    Body:stream.pipe(zlib.createGzip()),
                }
                stream.on('end', function() {
                    next() // ready for next entry
                })
                wait.push(s3.upload(param).promise())
            }
        })
        extract.on('error', function(error) {
            rej(error) 
        })
        extract.on('finish', function() {
            Promise.all(wait).then(x=>res())
        })
          
        s3.getObject({
            Bucket:result.OutputDataConfig.S3Uri.split('/')[2],
            Key:result.OutputDataConfig.S3Uri.split('/').slice(3,100).join('/')
        }).createReadStream().on('error', function(error) {
            rej(error) 
        })
        .pipe(gzip)
        .pipe(extract)
    })
}
