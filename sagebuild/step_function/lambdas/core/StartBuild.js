var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var codebuild=new aws.CodeBuild()

exports.handler=(event,context,cb)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
    codebuild.startBuild({
        projectName:event.projectName,
        environmentVariablesOverride:[{
            name:"IMAGE_TAG",
            value:event.tag
        },{
            name:"DOCKERFILE_PATH",
            value:event.dockerfile_path
        }]
    }).promise()
    .then(result=>cb(null,result.build))
    .catch(cb)
}
