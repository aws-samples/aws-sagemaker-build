var aws=require('aws-sdk')
aws.config.region=process.env.AWS_REGION 
var sagemaker=new aws.SageMaker()
var s3=new aws.S3()

exports.handler=(event,context,callback)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
    if(event.status.training.ModelArtifacts){
        var ModelDataUrl=event.status.training.ModelArtifacts.S3ModelArtifacts 
    }else{
        var ModelDataUrl=`${event.status.training.TrainingJobDefinition.OutputDataConfig.S3OutputPath}/${event.status.training.BestTrainingJob.TrainingJobName}/output/model.tar.gz`
    }
   
    var key= `versions/inference/v${event.params.version}.py`
    callback(null,{
        ExecutionRoleArn:event.params.modelrole,
        ModelName:`${event.params.name}-${event.params.id}`,
        PrimaryContainer:{
            Image:create_image_uri(event.params),
            ModelDataUrl,
            Environment:event.params.modelhostingenvironment || {}
        },
        Tags:[{
            Key:"sagebuild:stack",
            Value:event.params.stackname
        }]
    })
}
function create_image_uri(params){
    var algorithm=params.algorithm.toLowerCase()
    if(["kmeans","pca", "factorization-machines","linear-learner", "ntm", "randomcutforest"].includes(algorithm)){
        var account={
            "us-west-2":"174872318107",
            "us-east-1":"382416733822",
            "us-east-2":"404615174143",
            "eu-west-1":"438346466558",
            "ap-northeast-1":"351501993468"
        }[process.env.AWS_REGION]
    }else if(params.algorithm==="lda"){
        var account={
            "us-west-2":"999678624901",
            "us-east-1":"766337827248",
            "us-east-2":"999911452149",
            "eu-west-1":"266724342769",
            "ap-northeast-1":"258307448986"
        }[process.env.AWS_REGION]
    }else if(["xgboost","image-classification","seq2seq","blazingtext"].includes(algorithm)){
        var account={
            "us-west-2":"433757028032",
            "us-east-1":"811284229777",
            "us-east-2":"825641698319",
            "eu-west-1":"685385470294",
            "ap-northeast-1":"501404015308"
        }[process.env.AWS_REGION]
    }else if(params.algorithm==="forecasting-deepar"){
        var account={
            "us-west-2":"156387875391",
            "us-east-1":"522234722520",
            "us-east-2":"566113047672",
            "eu-west-1":"224300973850",
            "ap-northeast-1":"633353088612"
        }[process.env.AWS_REGION]
    }

    return `${account}.dkr.ecr.${process.env.AWS_REGION}.amazonaws.com/${algorithm}:1`
}
