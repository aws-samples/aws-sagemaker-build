var aws=require('aws-sdk')
var response = require('cfn-response')
aws.config.region=process.env.AWS_REGION
var lambda=new aws.Lambda()
var sagemaker=new aws.SageMaker()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    delete params.ServiceToken

    if(event.RequestType!=="Delete"){
        sagemaker.describeNotebookInstance(params).promise()
        .then(x=>response.send(event, context, response.SUCCESS,
            {
                Arn:x.RoleArn 
            },
            x.RoleArn.match(/arn:aws:iam::.*:role\/(.*)/)[1],
        ))
        .catch(error=>{
            console.log(error)
            response.send(event, context, response.FAILED)
        })
    }else{
        response.send(event, context, response.SUCCESS)    
    }
}

