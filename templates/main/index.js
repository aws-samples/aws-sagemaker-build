var fs=require('fs')
var _=require('lodash')
var stateMachines=require('./step_function/stateMachines')
var machines=stateMachines.machines
var frameworkConfigs=fs.readdirSync(`${__dirname}/step_function/lambdas/config/`)
    .filter(x=>x!=="index.js")
    .map(x=>x.toUpperCase())

var deployConfigs=fs.readdirSync(`${__dirname}/step_function/lambdas/core/`)
    .filter(x=>x!=="index.js")
    .map(x=>x.toUpperCase())

module.exports={
  "Parameters":require('./info/parameters'),
  "Conditions":Object.assign(
    _.fromPairs(deployConfigs.map(x=>[
        `ConfigDeploy${x}`,
        {"Fn::Equals":[{"Ref":`ConfigDeploy`},x]}
    ])),
    _.fromPairs(frameworkConfigs.map(x=>[
        `ConfigFramework${x}`,
        {"Fn::Equals":[{"Ref":`ConfigFramework`},x]}
    ])),
    stateMachines.conditions,
  {
    "BucketTrigger":{"Fn::And":[
        equal("BucketTriggerBuild","True"),
        {"Condition":"CreateDataBucket"}
    ]},
    "ExternalHostingPolicy":notEmpty("ExternalHostingPolicy"),
    "ExternalTrainingPolicy":notEmpty("ExternalTrainingPolicy"),
    "ExternalEndpointConfigLambda":notEmpty("EndpointConfigLambda"),
    "ExternalTrainingConfigLambda":notEmpty("TrainingConfigLambda"),
    "ExternalModelConfigLambda":notEmpty("ModelConfigLambda"),
    "NoteBookInstance":notEqual("NoteBookInstanceType","NONE"),
    "CreateDataBucket":equal("ExternalDataBucket","CREATE_BUCKET"),
    "CreateRepo":{"Fn::And":[
        equal("ExternalCodeCommitRepo","CREATE_REPO"),
        equal("ExternalGithubRepo","USE_CODECOMMIT_REPO")
    ]},
    "CreateRepoTrigger":notEqual("BranchBuildTrigger","EMPTY"),
    "UseCodeBucket":notEmpty("ExternalCodeBucket"),
    "IsCodeCommitRepo":equal("ExternalGithubRepo","USE_CODECOMMIT_REPO"),
    "SubscribeToExternalTopic":notEqual("ExternalLaunchTopic","EMPTY"),
    "InvalidConfiguration":{"Fn::And":[
        notEqual("ExternalGithubRepo","USE_CODECOMMIT_REPO"),
        notEqual("ExternalCodeCommitRepo","CREATE_REPO")
    ]}
  }),
  "Outputs":require('./info/outputs'),
  "Resources":Object.assign(
    {
    "ParamValidation":{
        "Type": "Custom::Variables",
        Condition:"InvalidConfiguration",
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["FailLambda", "Arn"] },
            "reason":"Cannot specify both CodeCommit and Github repo"
        }
    },
    "Notebook":{
        "Type": "Custom::Variables",
        Condition:"NoteBookInstance",
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["VariableLambda", "Arn"] },
            "Name":{"Ref":"AWS::StackName"}
        }
    },
    "LambdaVariables":{
        "Type": "Custom::Variables",
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["VariableLambda", "Arn"] },
            "EndpointConfig":{"Fn::If":[
                "ExternalEndpointConfigLambda",
                {"Ref":"EndpointConfigLambda"},
                {"Fn::GetAtt":["StepLambdaGetEndpointConfig","Arn"]},
            ]},
            "TrainingConfig":{"Fn::If":[
                "ExternalTrainingConfigLambda",
                {"Ref":"TrainingConfigLambda"},
                {"Fn::GetAtt":["StepLambdaGetTrainingConfig","Arn"]},
            ]},
            "ModelConfig":{"Fn::If":[
                "ExternalModelConfigLambda",
                {"Ref":"ModelConfigLambda"},
                {"Fn::GetAtt":["StepLambdaGetModelConfig","Arn"]},
            ]},
        }
    },
    "Variables":{
        "Type": "Custom::Variables",
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["VariableLambda", "Arn"] },
            "EndpointName":{
                "op":"toLowerCase",
                "value":{"Ref":"AWS::StackName"}
            },
            "DataBucket":{"Fn::If":[
                "CreateDataBucket",
                {"Ref":"DataBucket"},
                {"Ref":"ExternalDataBucket"}
            ]},
            "RepoName":{"Fn::If":[
                "CreateRepo",
                {"Fn::GetAtt":["CodeRepo","Name"]},
                {"Ref":"ExternalCodeCommitRepo"}
            ]},
            "RepoUrl":{"Fn::If":[
                "IsCodeCommitRepo",
                {"Fn::If":[
                    "CreateRepo",
                    {"Fn::GetAtt":["CodeRepo","CloneUrlHttp"]},
                    {"Fn::Sub":"https://codecommit.us-east-1.amazonaws.com/v1/repos/${ExternalCodeCommitRepo}"}
                ]},
                {"Ref":"ExternalGithubRepo"}
            ]},
            "RepoArn":{"Fn::If":[
                "IsCodeCommitRepo",
                {"Fn::If":[
                    "CreateRepo",
                    {"Fn::GetAtt":["CodeRepo","Arn"]},
                    {"Fn::Sub":"arn:aws:codecommit:${AWS::Region}:${AWS::AccountId}:${ExternalCodeCommitRepo}"}
                ]},
                {"Ref":"AWS::NoValue"}
            ]}
        }
    }},
    require('./cfn'),
    require('./step_function'),
    require('./codebuild'),
    require('./dashboard'),
    require('./SageMakerNotebook'),
    require('./alexa'),
    require('./lambda')
  ),
  "AWSTemplateFormatVersion": "2010-09-09",
  "Description": "Automates the building and deployment of SageMaker custom models using StepFunctions and CodeBuild",
  "Metadata":{
    "AWS::CloudFormation::Interface" :require('./info/interface') 
  }
}


function notEmpty(param){
    return notEqual(param,"EMPTY")
}

function notEqual(param,value){
    return {"Fn::Not":[
        {"Fn::Equals":[{"Ref":param},value]}]
    }
}

function equal(param,value){
    return {"Fn::Equals":[{"Ref":param},value]}
}
