var response = require('cfn-response')

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    delete params.ServiceToken

    Object.keys(params).forEach(function(key){
        var value=params[key]
        if(typeof value==="object"){
            if(value.op==="toLowerCase"){
                params[key]=value.value.toLowerCase()
            }else{
                params[key]=value.value
            }
        }
    })

    response.send(event, context, response.SUCCESS,params)
}

