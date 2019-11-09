var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var sagemaker=new aws.SageMaker()
var _=require('lodash')

exports.handler=(event,context,cb)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
    event.args.training.Tags=event.args.training.Tags || []
    event.args.training.Tags.push({
        Key:"sagebuild:BuildStack",
        Value:event.params.stackname
    })
    if(process.env.USESPOT==="True"){
        event.args.training.EnableManagedSpotTraining=true
        event.args.training.StoppingCondition.MaxWaitTimeInSeconds=event.args.training.StoppingCondition.MaxRuntimeInSeconds+(60*60)
    }
    if(process.env.VPC!=="NoVPC"){
        event.args.training.VpcConfig={
            Subnets:[process.env.SUBNET1,process.env.SUBNET2],
            SecurityGroupIds:[process.env.SECURITYGROUP]
        }
    }
    sagemaker.createTrainingJob(event.args.training).promise()
    .then(result=>cb(null,result))
    .catch(x=>cb(new Error(x)))
}
