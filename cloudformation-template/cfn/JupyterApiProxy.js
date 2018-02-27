var aws=require('aws-sdk')
var response = require('cfn-response')
aws.config.region=process.env.AWS_REGION || 'us-east-1'
var sagemaker=new aws.SageMaker()
var https=require('https')
var URL=require('url')

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties[event.RequestType.toLowerCase()]
    
    if(params){
        console.log(params)
        send(params).then(result=>{
            console.log(result)
            response.send(event, context, response.SUCCESS)
        })
        .catch(error=>{
            console.log(error)
            response.send(event, context, response.FAILED)
        })
    }else{
        response.send(event, context, response.SUCCESS)
    }
}

function send(args){
    return sagemaker.createPresignedNotebookInstanceUrl({
        NotebookInstanceName:args.InstanceName
    }).promise()
    .then(function(result){ 
        console.log(result)
        var url=URL.parse(result.AuthorizedUrl)
        console.log(url)
        return new Promise(function(res,rej){ 
            var opts={
                hostname:url.hostname,
                protocol:url.protocol,
                post:443,
                path:`${url.pathname}${url.search}`,
                method:'GET'
            }
            console.log(opts)
            var req=https.request(opts,x=>{
                opts.headers={
                    Cookie:x.headers['set-cookie'].join('; ')
                }
                opts.path=x.headers.location
                res(opts)
            })
            req.on('error',rej)
            req.end()
        })
    })
    .then(opts=>{
        console.log(opts)
        return new Promise(function(res,rej){
            var req=https.request(opts,x=>{
                opts.path=x.headers.location
                res(opts)
            })
            req.on('error',rej)
            req.end()
        })
    })
    .then(opts=>{
        console.log(opts)
        return new Promise(function(res,rej){
            var req=https.request(opts,x=>{
                opts.path=args.path
                opts.method=args.method
                res(opts)
            })
            req.on('error',rej)
            req.end()
        })
    })
    .then(opts=>{
        var body=[]
        console.log(opts)
        return new Promise(function(res,rej){
            var req=https.request(opts,response=>{
                response.on('data',chunk=>{
                    body.push(chunk)
                })
                response.on('end',()=>{
                    res(Buffer.concat(body).toString())
                })
            })
            if(args.body){
                req.write(args.body)
            }
            req.on('error',rej)
            req.end()
        })
    })
    .then(x=>{
        try{
            return JSON.parse(x)
        }catch(e){
            return x
        }
    })
}
