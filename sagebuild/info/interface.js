module.exports={
    "ParameterGroups":[{
        "Label":{"default":"General Parameters"},
        "Parameters":["ExternalTrainingPolicy","ExternalHostingPolicy","TrainEntryPoint",
        "TrainInstanceCount","TrainInstanceType","TrainSourceDir","TrainVolumeSize","InputMode","HostEntryPoint","HostSourceDir","ContainerLogLevel","HyperParameters","ModelHostingEnvironment","ConfigPresetType","Type","TrainMaxRun"]
    },{
        "Label":{"default":"MXNet Parameters"},
        "Parameters":["PyVersion","EnableCloudwatchMetrics"]
    },{
        "Label":{"default":"Tensorflow Parameters"},
        "Parameters":["EvaluationSteps","RequirementsFile","CheckpointPath"]
    },{
        "Label":{"default":"Data Bucket Configuration"},
        "Parameters":["ExternalDataBucket","ExternalLaunchTopic"]
    },{
        "Label":{"default":"Repository Configuration"},
        "Parameters":["BranchBuildTrigger","ExternalCodeCommitRepo","ExternalGithubRepo",]
    },{
        "Label":{"default":"Notebook Instance  Configuration"},
        "Parameters":["Type","NoteBookInstanceType","ExternalNotebook"]
    },{
        "Label":{"default":"Lambda Hook Configuration"},
        "Parameters":["EndpointConfigLambda","InferenceDockerfilePathLambda","TrainingDockerfilePathLambda","TrainingConfigLambda","ModelConfigLambda"]
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

