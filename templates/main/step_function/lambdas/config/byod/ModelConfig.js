var config=require('ModelConfig').byod

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    
    try{
        callback(null,config(event))
    }catch(e){
        callback(new Error(e))
    }
}



