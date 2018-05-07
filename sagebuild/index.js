var stateMachines=require('./step_function/stateMachines')
var machines=stateMachines.machines

module.exports={
  "Parameters":{
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
    "InferenceDockerfilePathLambda":{
        "Type":"String",
        "Default":"EMPTY"
    },
    "TrainingDockerfilePathLambda":{
        "Type":"String",
        "Default":"EMPTY"
    },
    "TrainingConfigLambda":{
        "Type":"String",
        "Default":"EMPTY"
    }
  },
  "Conditions":Object.assign(
    stateMachines.conditions,
  {
    "InternalNoteBookInstance":notEqual("NoteBookInstanceType","USE_EXTERNAL"),
    "ExternalNoteBookInstance":notEmpty("ExternalNotebook"),
    "ExternalEndpointConfigLambda":notEmpty("EndpointConfigLambda"),
    "ExternalInferenceDockerfilePathLambda":notEmpty("InferenceDockerfilePathLambda"),
    "ExternalTrainingDockerfilePathLambda":notEmpty("TrainingDockerfilePathLambda"),
    "ExternalTrainingConfigLambda":notEmpty("TrainingConfigLambda"),
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
  "Outputs":{
    "AlexaLambdaArn":{
        "Value":{"Fn::GetAtt":["AlexaLambda","Arn"]},
        "Description":"Lambda function for creating an alexa skill"
    },
    "NoteBookInstance":{
        "Value":{"Fn::If":[
            "NoteBookInstance",
            {"Fn::Sub":"https://console.aws.amazon.com/sagemaker/home?region=${AWS::Region}#/notebook-instances/${Notebook.Name}"},
            "EMPTY" 
        ]},
        "Description":"AWS Console url of your sagemaker notebook instance, from here you can open the instance"
    },
    "DashboardUrl":{
        "Value":{"Fn::Join":["",[
            "https://console.aws.amazon.com/cloudwatch/home?",
            "region=",{"Ref":"AWS::Region"},
            "#dashboards:name=",{"Ref":"dashboard"}
        ]]},
        "Description":"CloudWatch Dashboard that tracks Lambda, SageMaker, and step function metrics"
    },
    "TrainStatusTopic":{
        "Value":{"Ref":"TrainStatusTopic"},
        "Description":"SNS topic that gives success or failure updates of build"
    },
    "LaunchTopic":{
        "Value":{"Ref":"LaunchTopic"},
        "Description":"Topic that triggers a new build/train. Use this value to setup github webhook triggers."
    },
    "RollbackTopic":{
        "Value":{"Ref":"RollbackTopic"},
        "Description":"Topic that triggers a rollback fo the endpoint to the previous config"
    },
    "SageMakerEndpoint":{
        "Value":{"Fn::GetAtt":["Variables","EndpointName"]},
        "Description":"Name of the SageMaker endpoint"
    },
    "StateMachine":{
        "Value":{"Ref":"StateMachine"},
        "Description":"StepFunction StateMachine the runs the build"
    },
    "DataBucket":{
        "Value":{"Fn::GetAtt":["Variables","DataBucket"]},
        "Description":"S3 Bucket to put data for training in, will automaticaly trigger a new build"
    },
    "TrainingConfigLambda":{
        "Value":{"Fn::Sub":"${LambdaVariables.TrainingConfig}"},
        "Description":"Lambda function that returns the Training Job Config"
    },
    "EndpointConfigLambda":{
        "Value":{"Fn::Sub":"${LambdaVariables.EndpointConfig}"},
        "Description":"Lambda function that returns the Endpoint Config"
    },
    "TrainingDockerfilePathLambda":{
        "Value":{"Fn::Sub":"${LambdaVariables.TrainingDockerfilePath}"},
        "Description":"Lambda function that returns the path of the Training Dockerfile in the code repo"
    },
    "InferenceDockerfilePathLambda":{
        "Value":{"Fn::Sub":"${LambdaVariables.InferenceDockerfilePath}"},
        "Description":"Lambda function that returns the path of the Inference Dockerfile in the code repo"
    },
    "RepoUrl":{
        "Value":{"Fn::GetAtt":["Variables","RepoUrl"]},
        "Description":"CodeCommit repo to put Dockerfile code in, will automatically trigger a new build"
    },
    "StepFunctionConsole":{
        "Value":{"Fn::Sub":"https://console.aws.amazon.com/states/home?region=${AWS::Region}#/statemachines/view/${StateMachine}"},
        "Description":"AWS Console for the StepFunction StateMachine that controls the build"
    }
  },
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
    "AWS::CloudFormation::Interface" : {
        "ParameterGroups":[{
            "Label":{"default":"General Configuration"},
            "Parameters":["Type","NoteBookInstanceType","ExternalNotebook"]
        },{
            "Label":{"default":"Data Bucket Configuration"},
            "Parameters":["ExternalDataBucket","ExternalLaunchTopic"]
        },{
            "Label":{"default":"Repository Configuration"},
            "Parameters":["BranchBuildTrigger","ExternalCodeCommitRepo","ExternalGithubRepo",]
        }],
        "ParameterLabels":{
            "NoteBookInstanceType":{"default":"SageMaker Notebook Instance Type"},
            "ExternalNotebook":{"default":"External SageMaker Notebookt to use"},
            "ExternalDataBucket":{"default":"Training Data Bucket"},
            "BranchBuildTrigger":{"default":"Repository trigger branch"},
            "ExternalCodeCommitRepo":{"default":"AWS CodeCommit Repository"},
            "ExternalGithubRepo":{"default":"External Github Repository"},
            "ExternalLaunchTopic":{"default":"Additional SNS Launch Topic"},
            "Type":{"default":"Type of Pipeline"}
        }
    }
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
