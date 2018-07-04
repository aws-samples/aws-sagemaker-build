var fs=require('fs')
var _=require('lodash')
var stateMachines=require('../step_function/stateMachines')
var machines=stateMachines.machines
var frameworkConfigs=fs.readdirSync(`${__dirname}/../step_function/lambdas/config/`)
    .filter(x=>x!=="index.js")
    .map(x=>x.toUpperCase())

var deployConfigs=fs.readdirSync(`${__dirname}/../step_function/lambdas/core/`)
    .filter(x=>x!=="index.js")
    .map(x=>x.toUpperCase())

module.exports={
    AssetBucket:{
        "Type":"String",
    },
    AssetPrefix:{
        "Type":"String",
        "Default":"sagebuild"
    },
    ExternalTrainingPolicy:{
        "Type":"String",
        "Default":"NONE"
    },
    ExternalHostingPolicy:{
        "Type":"String",
        "Default":"NONE"
    },
    "ConfigFramework":{
        "Type":"String",
        "Default":"BYOD",
        "AllowedValues":frameworkConfigs
    },
    "ConfigDeploy":{
        "Type":"String",
        "Default":"SAGEMAKER",
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
        "AllowedValues":["ml.t2.medium","ml.m4.xlarge","ml.p2.xlarge","USE_EXTERNAL"],
        "Description":"The SageMaker Notebook Instance type that will be created and pre-populated with a sagebuild tutorial notebook"
    },
    "ExternalNotebook":{
        "Type":"String",
        "Default":"EMPTY",
        "Description":"(Optional) A SageMaker Notebook instance to be pre-populated with a sagebuild tutorial notebook"
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
        "Description":"Comma seperated list of branchs in the code repository that trigger a build when changed"
    },
    "EndpointConfigLambda":{
        "Type":"String",
        "Default":"EMPTY"
    },
    "TrainingConfigLambda":{
        "Type":"String",
        "Default":"EMPTY"
    },
    "ModelConfigLambda":{
        "Type":"String",
        "Default":"EMPTY"
    }
}
