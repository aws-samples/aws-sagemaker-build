var config=require('TrainingConfig')

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    try{
        callback(null,config.amazon(event))
    }catch(e){
        callback(new Error(e))
    }
}
