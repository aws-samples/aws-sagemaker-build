var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var codebuild=new aws.CodeBuild()
var ssm=new aws.SSM()




exports.handler=(event,context,cb)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
    try{
        Promise.all([
            ssm.getParameter({
                Name:process.env.PARAMETERSTORE
            }).promise(),
            ssm.getParameter({
                Name:process.env.VERSIONPARAMETERSTORE
            }).promise()
        ])
        .then(function(results){
            console.log(JSON.stringify(results,null,2))
            
            var params=JSON.parse(results[0].Parameter.Value)
            var version=(parseInt(results[1].Parameter.Value)+1).toString()
            if(params.TrainingImage){
                params.build.Training=false
            }
            if(params.InferenceImage){
                params.build.Inference=false
            }
            var name=`${params.stackname}-v${version}`
            Object.assign(event,params,{
                timestamp:new Date(),
                version,
                id:Date.now().toString(),
                name,
                TrainingTag:`${name}-Training`,
                InferenceTag:`${name}-Inference`
            })
            cb(null,{
                params:event,
                args:{
                    build:{
                        Training:{},
                        Inference:{}
                    },
                    training:{},
                    endpoint:{}
                },
                outputs:{
                    build:{
                        Training:{},
                        Inference:{}
                    },
                    training:{},
                    endpoint:{}
                },
                status:{
                    endpoint:{},
                    training:{},
                    build:{
                        Training:{},
                        Inference:{}
                    }
                }
            })
        })
        .catch(x=>cb(new Error(x)))
    }catch(x){
        cb(new Error(x))
    }
}

function addZeroBefore(n) {
  return (n < 10 ? '0' : '') + n;
}
