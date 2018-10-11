var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var sagemaker=new aws.SageMaker()

exports.handler=(event,context,cb)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
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
            HyperParameterTuningJobName:old_args.TrainingJobName.slice(0,32),
            TrainingJobDefinition:{
                AlgorithmSpecification:{
                    TrainingImage:old_args.AlgorithmSpecification.TrainingImage,
                    TrainingInputMode:old_args.AlgorithmSpecification.TrainingInputMode,
                    MetricDefinitions:[{
                        Name:event.params.tuningobjective.Name,
                        Regex:event.params.tuningobjective.Regex
                    }]
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
        console.log(JSON.stringify(args,null,2))
        sagemaker.createHyperParameterTuningJob(args).promise()
        .then(result=>cb(null,result))
        .catch(x=>cb(new Error(x)))
    }catch(e){
        cb(new Error(e))
    }
}
