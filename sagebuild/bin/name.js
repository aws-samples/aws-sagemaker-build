#! /usr/bin/env node
var config=require('../../config')
var fs=require('fs')
var _=require('lodash')
process.env.AWS_PROFILE=config.profile
process.env.AWS_DEFAULT_REGION=config.profile
var project="SageBuild"

exports.inc=()=>run({inc:true})
exports.get=()=>run({inc:false})

function run(options={}){
    var namespace=options.namespace || config.namespace

    try {
        var increments=require('../build/inc.json')
    } catch(e){
        try {
            var increments=require('./.inc.json')
            fs.unlinkSync(`${__dirname}/.inc.json`)
            fs.writeFileSync(__dirname+'/../build/inc.json',JSON.stringify(increments,null,2))
        } catch(e){
            var increments={}
        }
    }
    
    var full=`${namespace}`
    var path=`["${config.profile}"].["${namespace}"].["${config.region}"]`

    if(options.hasOwnProperty("set")){
        increment=options.set
        set(increment)
    }else{
        increment=_.get(increments,path,0)
    }

    if(options.inc){
        set(++increment)
    }

    if(options.prefix){
        return `${project}-${full}`
    }else{
        return `${project}-${full}-${increment}` 
    }

    function set(value){
        _.set(increments,path,parseInt(value))
        fs.writeFileSync(__dirname+'/../build/inc.json',JSON.stringify(increments,null,2))
    }
}


