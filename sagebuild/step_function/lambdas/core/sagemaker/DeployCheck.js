var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var codebuild=new aws.CodeBuild()
var ssm=new aws.SSM()

exports.handler=(event,context,cb)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
    try{
        var deployedName=event.status.endpoint.EndpointConfigName 
        var configArn=event.outputs.endpoint.EndpointConfigArn
        var configName=configArn.match(/arn:aws:sagemaker:.*:.*:endpoint-config\/(.*)/)[1]
        var success=deployedName.toLowerCase()===configName.toLowerCase()
        cb(null,success)
    }catch(x){
        cb(new Error(x))
    }
}
