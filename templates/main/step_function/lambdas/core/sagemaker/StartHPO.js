var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var _=require('lodash')
var crypto = require('crypto');
var sagemaker=new aws.SageMaker()

exports.handler=(event,context,cb)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
    var shasum = crypto.createHash('sha1');
    try{
        event.args.training.Tags=event.args.training.Tags || []
        event.args.training.Tags.push({
            Key:"sagebuild:BuildStack",
            Value:event.params.stackname
        })
        hyperParams={
            static:{},
            catagorical:[],
            continuous:[],
            integer:[]
        }
        old_args=event.args.training
        Object.keys(old_args.HyperParameters).forEach(function(key){
            val=old_args.HyperParameters[key]
            try{
                parsed=JSON.parse(val)
            }catch(e){
                parsed=val     
            }

            if(typeof(parsed)==="object"){
                parsed.Name=key
                if(parsed.Values){
                    hyperParams.catagorical.push(parsed)
                }else if(typeof(parsed.MaxValue)!=="undefined"){
                    if(parsed.integer){
                        delete parsed.integer
                        hyperParams.integer.push(parsed)
                    }else{
                        delete parsed.integer
                        hyperParams.continuous.push(parsed)
                    }
                }else{
                    hyperParams.static[key]=val
                }
            }else{
                hyperParams.static[key]=val
            }
        })
        shasum.update(old_args.TrainingJobName);

        args={
            HyperParameterTuningJobConfig:{
                HyperParameterTuningJobObjective:{
                    MetricName:event.params.tuningobjective.Name,
                    Type:event.params.tuningobjective.Type
                },
                ParameterRanges:{
                    CategoricalParameterRanges:hyperParams.catagorical,
                    ContinuousParameterRanges:hyperParams.continuous,
                    IntegerParameterRanges:hyperParams.integer
                },
                ResourceLimits:{
                    MaxNumberOfTrainingJobs:event.params.maxtrainingjobs,
                    MaxParallelTrainingJobs:event.params.maxparalleltrainingjobs,
                },
                Strategy:"Bayesian"
            },
            HyperParameterTuningJobName:shasum.digest('hex').slice(0,32),
            TrainingJobDefinition:{
                AlgorithmSpecification:{
                    TrainingImage:old_args.AlgorithmSpecification.TrainingImage,
                    TrainingInputMode:old_args.AlgorithmSpecification.TrainingInputMode
                },
                InputDataConfig:old_args.InputDataConfig,
                OutputDataConfig:old_args.OutputDataConfig,
                ResourceConfig:old_args.ResourceConfig,
                RoleArn:old_args.RoleArn,
                StoppingCondition:old_args.StoppingCondition,
                StaticHyperParameters:hyperParams.static,
            },
            Tags:old_args.Tags
        }
        if(event.params.tuningobjective.Regex){
            var defs=_.get(old_args,"AlgorithmSpecification.MetricDefinitions",[])
            defs.push({
                Name:event.params.tuningobjective.Name,
                Regex:event.params.tuningobjective.Regex
            })
            args.TrainingJobDefinition.AlgorithmSpecification.MetricDefinitions=defs
        }

        if(event.params.parentJobs && event.params.parentJobs.length>0){
            args.WarmStartConfig={
                ParentHyperParameterTuningJobs:event.params.parentJobs.map(
                    x=>{return{HyperParameterTuningJobName:x}}
                ),
                WarmStartType:event.params.WarmStartType || "IdenticalDataAndAlgorithm"
            }
        }
        console.log(JSON.stringify(args,null,2))
        sagemaker.createHyperParameterTuningJob(args).promise()
        .then(result=>cb(null,result))
        .catch(x=>cb(new Error(x)))
    }catch(e){
        cb(new Error(e))
    }
}
