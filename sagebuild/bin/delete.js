#! /usr/bin/env node
var check=require('./check')
var aws=require('aws-sdk')
var config=require('../../config')
var cf=new aws.CloudFormation({region:config.region})
var name=require('./name')
var wait=require('./wait')
var bucket=require('../../config').templateBucket
if(require.main===module){
    run()
}

async function run(){
    var result=await cf.deleteStack({
        StackName:await name.get(),
    }).promise()
    await wait()
}
