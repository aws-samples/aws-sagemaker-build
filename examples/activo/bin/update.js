#! /usr/bin/env node

var check=require('./check')
var aws=require('aws-sdk')
var config=require('../config')
var cf=new aws.CloudFormation({region:config.region})
var name=require('./name')
var wait=require('./wait')
var bucket=config.templateBucket
if(require.main===module){
    run()
}

async function run(){
    var template=await check()
    var result=await cf.updateStack({
        StackName:await name.get(),
        Capabilities:["CAPABILITY_NAMED_IAM"],
        TemplateURL:`http://s3.amazonaws.com/${bucket}/${config.templatePrefix}/templates/${config.name}.json`,
        Parameters:Object.keys(config.parameters)
            .map(param=>{return{
                ParameterKey:param,
                ParameterValue:config.parameters[param]
            }})

    }).promise()
    await wait()
}
