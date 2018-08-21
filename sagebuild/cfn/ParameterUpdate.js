var response = require('cfn-response')
var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION
var ssm=new aws.SSM()

exports.handler=function(event,context,callback){
    console.log(JSON.stringify(event,null,2))
    var params=event.ResourceProperties
    delete params.ServiceToken

    if(event.RequestType!=="Delete"){
        ssm.getParameter({
            Name:params.name
        }).promise()
        .then(function(result){
            console.log(JSON.stringify(result,null,2))
            value=JSON.parse(result.Parameter.Value)
            value=assign(value,JSON.parse(params.value))
            return ssm.putParameter({
                Name:params.name,
                Type:result.Parameter.Type,
                Value:JSON.stringify(value),
                Overwrite:true
            }).promise()
        })
        .then(()=>response.send(event, context, response.SUCCESS))
        .catch(e=>{
            console.log(e)
            response.send(event, context, response.FAILED)
        })       
    }else{
        response.send(event, context, response.SUCCESS,params)
    }
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function isShallow(item) {
  return Array.isArray(item) && item.find((item) => typeof item === 'object') ? false : true;
}

function assign(target, ...sources) {

  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        assign(target[key], source[key]);
      } else {
        if (isShallow(source[key])) Object.assign(target, { [key]: source[key] });
        else {
          if (!target[key]) Object.assign(target, { [key]: [] });
          Object.assign(target, { [key]: source[key].map((item, index) => assign(target[key][index] || {}, item)) });
        }
      }
    }
  }

  return assign(target, ...sources);
}
