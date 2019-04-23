var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var codebuild=new aws.CodeBuild()

exports.handler=(event,context,cb)=>{
    console.log(JSON.stringify(event,null,2))
    codebuild.batchGetBuilds({
        ids:[event.outputs.build.Inference.id] 
    }).promise()
    .then(result=>cb(null,result.builds[0]))
    .catch(x=>{
        console.log(x)
        cb(new Error(x))
    })
}
