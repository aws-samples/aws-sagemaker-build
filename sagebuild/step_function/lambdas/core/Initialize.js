var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var codebuild=new aws.CodeBuild()

exports.handler=(event,context,cb)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
    try{
        var date=new Date()
        var timestamp=`${date.getFullYear().toString()}-${addZeroBefore(date.getMonth()+1)}-${addZeroBefore(date.getDate())}-${addZeroBefore(date.getHours())}-${addZeroBefore(date.getMinutes())}-${addZeroBefore(date.getSeconds())}`
        var name=`${process.env.PARAMSTACKNAME}-${timestamp}`
        
        var params={} 
        Object.keys(process.env)
            .filter(x=>x.match(/PARAM.*/))
            .map(x=>[x.match(/PARAM(.*)/)[1].toLowerCase(),process.env[x]])
            .forEach(x=>params[x[0]]=x[1])
        
        var params=Object.assign({},params,event,{
            timestamp,
            name,
        })

        cb(null,{
            params,
            args:{
                build:{},
                training:{},
                endpoint:{}
            },
            outputs:{
                build:{},
                training:{},
                endpoint:{}
            },
            status:{
                endpoint:{},
                training:{}
            }
        })
    }catch(x){
        cb(new Error(x))
    }
}

function addZeroBefore(n) {
  return (n < 10 ? '0' : '') + n;
}
