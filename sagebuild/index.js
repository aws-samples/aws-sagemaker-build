var fs=require('fs')
var _=require('lodash')
var stateMachines=require('./step_function/stateMachines')
var machines=stateMachines.machines
var configs=fs.readdirSync(`${__dirname}/step_function/lambdas/config/`)
    .filter(x=>x!=="index.js")
    .map(x=>x.toUpperCase())

module.exports={
  "Parameters":require('./info/parameters'),
  "Conditions":Object.assign(
    _.fromPairs(configs.map(x=>[
        `Config${x}`,
        {"Fn::Equals":[{"Ref":"ConfigPresetType"},x]}
    ])),
    stateMachines.conditions,
  {
    "InternalNoteBookInstance":notEqual("NoteBookInstanceType","USE_EXTERNAL"),
    "ExternalNoteBookInstance":notEmpty("ExternalNotebook"),
    "ExternalEndpointConfigLambda":notEmpty("EndpointConfigLambda"),
    "ExternalInferenceDockerfilePathLambda":notEmpty("InferenceDockerfilePathLambda"),
    "ExternalTrainingDockerfilePathLambda":notEmpty("TrainingDockerfilePathLambda"),
    "ExternalTrainingConfigLambda":notEmpty("TrainingConfigLambda"),
    "ExternalModelConfigLambda":notEmpty("ModelConfigLambda"),
    "NoteBookInstance":{"Fn::Or":[
        notEqual("NoteBookInstanceType","USE_EXTERNAL"),
        notEmpty("ExternalNotebook")
    ]},
    "CreateDataBucket":equal("ExternalDataBucket","CREATE_BUCKET"),
    "CreateRepo":{"Fn::And":[
        equal("ExternalCodeCommitRepo","CREATE_REPO"),
        equal("ExternalGithubRepo","USE_CODECOMMIT_REPO")
    ]},
    "CreateRepoTrigger":notEqual("ExternalGithubRepo","USE_CODECOMMIT_REPO"),
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
            "Name":{"Fn::If":[
                "InternalNoteBookInstance",
                {"Ref":"AWS::StackName"},
                {"Ref":"ExternalNotebook"}
            ]}
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
            "InferenceDockerfilePath":{"Fn::If":[
                "ExternalInferenceDockerfilePathLambda",
                {"Ref":"InferenceDockerfilePathLambda"},
                {"Fn::GetAtt":["StepLambdaGetInferenceDockerfilePath","Arn"]},
            ]},
            "TrainingDockerfilePath":{"Fn::If":[
                "ExternalTrainingDockerfilePathLambda",
                {"Ref":"TrainingDockerfilePathLambda"},
                {"Fn::GetAtt":["StepLambdaGetTrainingDockerfilePath","Arn"]},
            ]}
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
            ]}
        }
    }},
    require('./cfn'),
    require('./step_function'),
    require('./codebuild'),
    require('./dashboard'),
    require('./SageMakerNotebook'),
    require('./alexa')
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
