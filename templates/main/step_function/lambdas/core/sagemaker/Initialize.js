var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var codebuild=new aws.CodeBuild()
var ssm=new aws.SSM()
var _=require('lodash')

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
            var version=(
                parseInt(JSON.parse(results[1].Parameter.Value).version_number)+1
            ).toString()

            _.defaultsDeep(params,{
                build:{
                    Training:!params.TrainingImage && params.configframework==="BYOD",
                    Inference:!params.InferenceImage && params.configframework==="BYOD"
                },
                deployEndpoint:true
            })
            
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
                    ETL:{},
                    build:{
                        Training:{},
                        Inference:{}
                    },
                    training:{},
                    endpoint:{}
                },
                status:{
                    ETL:{},
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
