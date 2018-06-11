var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var sagemaker=new aws.SageMaker()
var crypto=require('crypto')
var hash=crypto.randomBytes(8).toString('base64').replace('=','')

exports.handler=(event,context,cb)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))

    sagemaker.listEndpointConfigs({
        MaxResults:1,
        NameContains:event.params.stackname,
        SortBy:"CreationTime",
        SortOrder:"Descending"
    }).promise()
    .then(result=>{
        if(result.EndpointConfigs.length>0){
            var EndpointConfigName=result.EndpointConfigs[0].EndpointConfigName,
            return sagemaker.createEndpoint({
                EndpointConfigName,
                EndpointName:event.params.stackname
            }).promise()
        }else{
            return {status:"empty"}
        }
    })
    .then(result=>{
        cb(null,result)
    })
    .catch(x=>cb(new Error(x)))
}
