var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var lambda=new aws.Lambda()
var util=require('./lambda')
var _=require('lodash')

exports.proxy=function(body,type="RequestResponse"){
    return lambda.invoke({
        FunctionName:process.env.ELASTICSEARCH,
        InvocationType:type,
        Payload:JSON.stringify(body)
    }).promise()   
    .catch(x=>{
        console.log(x)
        console.log(x.data)
        throw JSON.stringify(x.data)
    })
}

exports.proxy_parse=function(body,type="RequestResponse"){
    return lambda.invoke({
        FunctionName:process.env.ELASTICSEARCH,
        InvocationType:type,
        Payload:JSON.stringify(body)
    }).promise()   
    .then(util.val)
    .catch(x=>{
        console.log(x)
        console.log(x.data)
        throw JSON.stringify(x.data)
    })
}
