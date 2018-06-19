var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var sagemaker=new aws.SageMaker()

exports.handler=(event,context,cb)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
    
    sagemaker.deleteModel({ModelName:event.args.model.ModelName}).promise()
    .then(result=>{
        cb(null,result)
    })
    .catch(x=>cb(new Error(x)))
}
