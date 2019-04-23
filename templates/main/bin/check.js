#! /usr/bin/env node
var aws=require('./aws')
var fs=require('fs')
var Promise=require('bluebird')
var cf=new aws.CloudFormation()
var s3=new aws.S3()
var chalk=require('chalk')
var config=require('../config')
var bucket=config.templateBucket

if(require.main === module){
    run()
}
module.exports=run
async function run(){
    var obj=require('../')
    var file=`${__dirname}/../../../build/templates/main.json`
    var template=JSON.stringify(obj,null,2)
    console.log(file) 
    
    fs.writeFileSync(file,JSON.stringify(require('../'),null,2))
    await s3.putObject({
        Bucket:bucket,
        Key:`${config.templatePrefix}/templates/test.json`,
        Body:template
    }).promise()

    var result=await cf.validateTemplate({
        TemplateURL:`http://s3.amazonaws.com/${bucket}/${config.templatePrefix}/templates/test.json`
    }).promise()

    console.log(result)
    console.log(`Resources: ${Object.keys(obj.Resources).length}`)
    fs.writeFileSync(file,JSON.stringify(require('../'),null,2))
    return JSON.stringify(obj,null,2)
}
