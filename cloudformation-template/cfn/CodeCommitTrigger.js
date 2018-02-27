var aws=require('aws-sdk')
var response = require('cfn-response')
aws.config.region=process.env.AWS_REGION
var cc=new aws.CodeCommit()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    delete params.ServiceToken
  
    cc.getRepositoryTriggers({
        repositoryName:params.repositoryName
    }).promise()
    .then(function(result){
        var triggers=result.triggers.filter(x=>x.name!==params.trigger.name)
        if(event.RequestType!=="Delete"){ 
            triggers.push(params.trigger)
        }
        return cc.putRepositoryTriggers({
            repositoryName:params.repositoryName,
            triggers
        }).promise()
    })
    .then(()=>response.send(event, context, response.SUCCESS))
    .catch(e=>{
        console.log(e)
        response.send(event, context, response.FAILED)
    })
}

