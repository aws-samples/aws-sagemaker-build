var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var sagemaker=new aws.SageMaker()

exports.handler=(event,context,cb)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
    return sagemaker.listModels({
        NameContains:event.params.stackname,
        SortBy:"CreationTime",
        SortOrder:"Descending"
    }).promise()
    .then(result=>{
        cb(null,result.Models.map(x=>x.ModelName))
    })
    .catch(x=>cb(new Error(x)))
}
