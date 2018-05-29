var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var sagemaker=new aws.SageMaker()

exports.handler=(event,context,cb)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
    event.model.name=event.name
    sagemaker.createModel(event.params.model.args).promise()
    .then(result=>{
        event.model.arn=result.ModelArn
        return sagemaker.listModels({
            NameContains:event.Stackname,
            SortBy:"CreationTime",
            SortOrder:"Descending",
            MaxResults:10
        }).promise()
    })
    .then(result=>{
        event.model.old=result.Models.map(x=>x.ModelName)
        cb(null,event.model)
    })
    .catch(cb)
}
