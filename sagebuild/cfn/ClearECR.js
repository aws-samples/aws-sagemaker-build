var response = require('cfn-response')
var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var cb=new aws.CodeBuild()
var s3=new aws.S3()
var ecr=new aws.ECR()
var lambda=new aws.Lambda()

exports.handler = function(event, context,callback) {
    console.log(JSON.stringify(event,null,2))

    if(event.RequestType==="Delete"){
        new Promise(function(res,rej){
            var token
            next()
            function next(){
                ecr.listImages({
                    repositoryName:event.ResourceProperties.repo,
                    nextToken:token
                }).Promise()
                .then(function(result){
                    return ecr.batchDeleteImage({
                        imageIds:result.imageIds,
                        repositoryName:event.ResourceProperties.repo
                    }).promise()
                    .then(function(){
                        if(result.nextToken){
                            token=result.nextToken
                            setTimeout(()=>next(),500)
                        }else{
                            res()
                        }
                    })
                })
                .catch(rej)
            }
        })
        .then(()=>response.send(event, context, response.SUCCESS))
        .catch(x=>{
            console.log(x)
            response.send(event, context, response.SUCCESS)
        })
    }else{
        response.send(event, context, response.SUCCESS)
    }
}

