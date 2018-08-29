var fs=require('fs')
var _=require('lodash')
var config=require('../../config')
var stateMachines=require('../step_function/stateMachines')
var machines=stateMachines.machines
var frameworkConfigs=fs.readdirSync(`${__dirname}/../step_function/lambdas/config/`)
    .filter(x=>x!=="index.js")
    .map(x=>x.toUpperCase())

var deployConfigs=fs.readdirSync(`${__dirname}/../step_function/lambdas/core/`)
    .filter(x=>x!=="index.js")
    .map(x=>x.toUpperCase())

module.exports={
    Parameters:{
        "Type":"String",
        "Default":"{}",
        "Description":"A JSON string that is merged into the SSM parameter store holding build parameters.",
    },
    AssetBucket:{
        "Type":"String",
        "Description":"the S3 bucket that holds the stack resources. Do not change unless you know what you are doing.",
        "Default":config.templateBucket
    },
    AssetPrefix:{
        "Type":"String",
        "Description":"the S3 path that holds the stack resources. Do not change unless you know what you are doing.",
        "Default":config.templatePrefix
    },
    ExternalTrainingPolicy:{
        "Type":"String",
        "Description":"(Optional) the Arn of an IAM policy that is added to the Training role sagemaker uses",
        "Default":"EMPTY"
    },
    ExternalHostingPolicy:{
        "Type":"String",
        "Description":"(Optional) the Arn of an IAM policy that is added to the Model role sagemaker uses",
        "Default":"EMPTY"
    },
    "ConfigFramework":{
        "Type":"String",
        "Description":"The Configuration of the stack.",
        "Default":"BYOD",
        "AllowedValues":frameworkConfigs
    },
    "ConfigDeploy":{
        "Type":"String",
        "Default":"SAGEMAKER",
        "Description":"The Type of deployment to use.",
        "AllowedValues":deployConfigs
    },
    "Type":{
        "Type":"String",
        "Default":"DockerTrainDeploy",
        "AllowedValues":machines,
        "Description":"The type of SageMaker build pipeline to create"
    },
    "NoteBookInstanceType":{
        "Type":"String",
        "Default":"ml.t2.medium",
        "AllowedValues":["ml.t2.medium","ml.m4.xlarge","ml.p2.xlarge","NONE"],
        "Description":"The SageMaker Notebook Instance type that will be created and pre-populated with a sagebuild tutorial notebook"
    },
    "ExternalDataBucket":{
        "Type":"String",
        "Default":"CREATE_BUCKET",
        "Description":"(Optional) S3 Bucket to use for training data"
    },
    "ExternalCodeBucket":{
        "Type":"String",
        "Default":"EMPTY",
        "Description":"(Optional) S3 Bucket to get container build zips"
    },
    "ExternalLaunchTopic":{
        "Type":"String",
        "Default":"EMPTY",
        "Description":"(Optional) Additional SNS Topic Used to trigger rebuilds"
    },
    "ExternalCodeCommitRepo":{
        "Type":"String",
        "Default":"CREATE_REPO",
        "Description":"(Optional) AWS CodeCommit repository that contains Dockerfile code."
    },
    "ExternalGithubRepo":{
        "Type":"String",
        "Default":"USE_CODECOMMIT_REPO",
        "Description":"(Optional) Http clone URL of a Github repository that contians Dockerfile code."
    },
    "BranchBuildTrigger":{
        "Type":"CommaDelimitedList",
        "Default":"master",
        "Description":"(Optional) Comma seperated list of branchs in the code repository that trigger a build when changed"
    },
    "EndpointConfigLambda":{
        "Type":"String",
        "Description":"The Arn of a Lambda function to override the default Endpoint Config lambda",
        "Default":"EMPTY"
    },
    "TrainingConfigLambda":{
        "Type":"String",
        "Description":"The Arn of a Lambda function to override the default Training Config lambda",
        "Default":"EMPTY"
    },
    "ModelConfigLambda":{
        "Type":"String",
        "Description":"The Arn of a Lambda function to override the default Model Config lambda",
        "Default":"EMPTY"
    }
}
