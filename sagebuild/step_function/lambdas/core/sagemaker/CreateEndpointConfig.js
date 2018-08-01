var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var sagemaker=new aws.SageMaker()

exports.handler=(event,context,cb)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
    
    var args=Object.assign({
        EndpointConfigName:`${event.params.name}-${event.params.id}`,
        Tags:[]
    },event.args.endpoint) 
    
    if(event.params.models[0]){
        args.Tags.push({
            Key:"sagebuild:previous",Value:event.params.models[0]
        })
    }
    sagemaker.createEndpointConfig(args).promise()
    .then(result=>{
        cb(null,result)
    })
    .catch(x=>cb(new Error(x)))
}
