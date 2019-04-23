module.exports={
    "ParameterGroups":[{
        "Label":{"default":"General Parameters"},
        "Parameters":["ExternalTrainingPolicy","ExternalHostingPolicy","ConfigFramework","ConfigDeploy","Type","Parameters"]
    },{
        "Label":{"default":"Data Bucket Configuration"},
        "Parameters":["ExternalDataBucket","ExternalLaunchTopic","BucketTriggerBuild"]
    },{
        "Label":{"default":"Repository Configuration"},
        "Parameters":["BranchBuildTrigger","ExternalCodeCommitRepo","ExternalGithubRepo","ExternalCodeBucket"]
    },{
        "Label":{"default":"Notebook Instance  Configuration"},
        "Parameters":["Type","NoteBookInstanceType"]
    },{
        "Label":{"default":"Lambda and Step Function Hook Configuration"},
        "Parameters":["EndpointConfigLambda","TrainingConfigLambda","ModelConfigLambda","ETLStepFuction","PostProcessStepFuction"]
    }],
    "ParameterLabels":{
        "BucketTriggerBuild":{"default":"Data Bucket Trigger"},
        "ExternalTrainingPolicy":{"default":"Additional Training IAM Policy"},
        "ExternalHostingPolicy":{"default":"Additional Hosting IAM Policy"},
        "ConfigFramework":{"default":"Configuration"},
        "EndpointConfigLambda":{"default":"Endpoint Config Lambda Override"},
        "TrainingConfigLambda":{"default":"Training Config Lambda Override"},
        "ModelConfigLambda":{"default":"Model Config Lambda Override"},
        "ExternalCodeBucket":{"default":"External Code Bucket"},
        "NoteBookInstanceType":{"default":"SageMaker Notebook Instance Type"},
        "ExternalDataBucket":{"default":"External Training Data Bucket"},
        "BranchBuildTrigger":{"default":"Repository trigger branch"},
        "ExternalCodeCommitRepo":{"default":"External AWS CodeCommit Repository"},
        "ExternalGithubRepo":{"default":"External Github Repository"},
        "ExternalLaunchTopic":{"default":"Additional SNS Launch Topic"},
        "Type":{"default":"Type of Pipeline"},
        "ETLStepFuction":{"default":"ETL StepFunction"},
        "PostProcessStepFuction":{"default":"Post deployment StepFunction"}
    }
}

