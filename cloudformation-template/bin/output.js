#! /usr/bin/env node
var check=require('./check')
var aws=require('./aws')
var config=require('../../config')
var cf=new aws.CloudFormation({region:config.region})
var name=require('./name')
var _=require('lodash')
if(require.main===module){
    run().then(x=>console.log(JSON.stringify(x,null,2)))
}

async function run(){
    var StackName=await name.get()
    var output=await cf.describeStacks({StackName}).promise()
    return _.fromPairs(output.Stacks[0].Outputs
        .map(x=>[x.OutputKey,x.OutputValue]))
}
