#! /usr/bin/env node
var Promise=require('bluebird')
var aws=require('./aws')
var chalk=require('chalk')
var cf=new aws.CloudFormation()
const ora = require('ora');
var name=require('./name')

module.exports=wait

async function wait(){
    var StackName=name.get()
    console.log(StackName)
    await new Promise(function(res,rej){
        console.log("Waiting on stack:"+StackName)
        const spinner = new Spinner()
        next()
        function next(){
            cf.describeStacks({
                StackName:StackName
            }).promise()
            .then(x=>x.Stacks[0].StackStatus)
            .then(status=>{
                spinner.update(status)
                if([
                    "UPDATE_COMPLETE",
                    "CREATE_COMPLETE",
                    "UPDATE_ROLLBACK_COMPLETE",
                    "DELETE_COMPLETE"
                ].includes(status)){
                    spinner.succeed(StackName+":"+status) 
                    res()
                }else if([
                    "UPDATE_IN_PROGRESS",
                    "UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS",
                    "UPDATE_COMPLETE_CLEANUP_IN_PROGRESS",
                    "UPDATE_ROLLBACK_IN_PROGRESS",
                    "ROLLBACK_IN_PROGRESS",
                    "DELETE_IN_PROGRESS",
                    "CREATE_IN_PROGRESS"
                ].includes(status)){
                    setTimeout(()=>next(),5000)
                }else{
                    spinner.fail(StackName+":"+status)
                    rej(status)
                }
            })
            .tapCatch(error=>{
                spinner.fail(StackName+":"+error.message)
            })
            .catch(rej)
        }
    })
}

function Spinner(){
    var self=this
    this.spinner = ora({
        text:'Getting Stack Status',
        spinner:"bouncingBar"
    }).start();
    this.spinner.color = 'yellow';
    this.update=function(txt){
        this.spinner.text=txt
    }
    this.succeed=this.spinner.succeed.bind(this.spinner)
    this.fail=this.spinner.fail.bind(this.spinner)
}
