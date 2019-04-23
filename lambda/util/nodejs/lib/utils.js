exports.try_wrap=function(func){
    return function(event,context,callback){
        try{
            func(event,context,callback)       
        }catch(e){
            console.log(e)
            callback(new Error(e))
        }
    }
}

exports.catch=function(callback){
    return function(error){
        console.log(error)
        callback(new Error(error))
    }
}

