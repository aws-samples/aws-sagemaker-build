#! /usr/bin/env node
var check=require('./check')
var aws=require('./aws')
var config=require('../../config')
var cf=new aws.CloudFormation({region:config.region})
var name=require('./name')
var bucket=require('../../config').templateBucket
var wait=require('./wait')
var _=require('lodash')
if(require.main===module){
    run()
}

async function run(){
    var template=await check()
    await name.inc()
    var result=await cf.createStack({
        StackName:await name.get(),
        Capabilities:["CAPABILITY_NAMED_IAM"],
        DisableRollback:true,
        TemplateURL:`http://s3.amazonaws.com/${bucket}/sagebuild.json`,
        Parameters:Object.keys(config.parameters)
            .map(param=>{return{
                ParameterKey:param,
                ParameterValue:config.parameters[param]
            }})
    }).promise()
    await wait()
}
