var fs=require('fs')

exports.get=function get(){
    try{
        var increment=JSON.parse(fs.readFileSync(`${__dirname}/.inc`,'utf-8')).val
    }catch(e){
        var increment=1
    }

    return `SageBuild-${increment}`     
}
exports.inc=function inc(){
    try{
        var increment=JSON.parse(fs.readFileSync(`${__dirname}/.inc`,'utf-8')).val
    }catch(e){
        var increment=1
    }
    fs.writeFileSync(`${__dirname}/.inc`,JSON.stringify({val:++increment}))
}
