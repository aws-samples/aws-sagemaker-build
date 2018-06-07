var fs=require('fs')
var _=require('lodash')
var stateMachines=require('../step_function/stateMachines')
var machines=stateMachines.machines
var configs=fs.readdirSync(`${__dirname}/../step_function/lambdas/config/`)
    .filter(x=>x!=="index.js")
    .map(x=>x.toUpperCase())

module.exports={
    AssetBucket:{
        "Type":"String",
    },
    ExternalTrainingPolicy:{
        "Type":"String",
        "Default":"NONE"
    },
    ExternalHostingPolicy:{
        "Type":"String",
        "Default":"NONE"
    },
    TrainEntryPoint:{
        "Type":"String",
        "Default":"NONE",
        "Description":"Path (absolute or relative) to the Python file which should be executed as the entry point to training."
    },
    HostInstanceCount:{
        "Type":"String",
        "Default":"1",
        "Description":"Number of Amazon EC2 instances to use for Hosting."
    },
    HostInstanceType:{
        "Type":"String",
        "Default":"ml.t2.medium",
        "AllowedValues":[
            "ml.t2.medium",
            "ml.t2.large",
            "ml.t2.xlarge",
            "ml.t2.2xlarge",
            "ml.m4.xlarge",
            "ml.m4.2xlarge",
            "ml.m4.4xlarge",
            "ml.m4.10xlarge",
            "ml.m4.16xlarge",
            "ml.m5.large",
            "ml.m5.xlarge",
            "ml.m5.2xlarge",
            "ml.m5.4xlarge",
            "ml.m5.12xlarge",
            "ml.m5.24xlarge",
            "ml.c4.large",
            "ml.c4.xlarge",
            "ml.c4.2xlarge",
            "ml.c4.4xlarge",
            "ml.c4.8xlarge",
            "ml.p2.xlarge",
            "ml.p2.8xlarge",
            "ml.p2.16xlarge",
            "ml.p3.2xlarge",
            "ml.p3.8xlarge",
            "ml.p3.16xlarge",
            "ml.c5.large",
            "ml.c5.xlarge",
            "ml.c5.2xlarge",
            "ml.c5.4xlarge",
            "ml.c5.9xlarge",
            "ml.c5.18xlarge"
        ],
        "Description":"Type of EC2 instance to use for training, for example, 'ml.c4.xlarge'."
    },
    TrainInstanceCount:{
        "Type":"String",
        "Default":"1",
        "Description":"Number of Amazon EC2 instances to use for training."
    },
    TrainInstanceType:{
        "Type":"String",
        "Default":"ml.m4.xlarge",
        "AllowedValues":[
            "ml.m4.xlarge",
            "ml.m4.2xlarge",
            "ml.m4.4xlarge",
            "ml.m4.10xlarge",
            "ml.m4.16xlarge",
            "ml.m5.large",
            "ml.m5.xlarge",
            "ml.m5.2xlarge",
            "ml.m5.4xlarge",
            "ml.m5.12xlarge",
            "ml.m5.24xlarge",
            "ml.c4.xlarge",
            "ml.c4.2xlarge",
            "ml.c4.4xlarge",
            "ml.c4.8xlarge",
            "ml.p2.xlarge",
            "ml.p2.8xlarge",
            "ml.p2.16xlarge",
            "ml.p3.2xlarge",
            "ml.p3.8xlarge",
            "ml.p3.16xlarge",
            "ml.c5.xlarge",
            "ml.c5.2xlarge",
            "ml.c5.4xlarge",
            "ml.c5.9xlarge",
            "ml.c5.18xlarge"
        ],
        "Description":"Type of EC2 instance to use for training, for example, 'ml.c4.xlarge'."
    },
    TrainSourceFile:{
        "Type":"String",
        "Default":"NONE",
        "Description":"Path (absolute or relative) to a directory with any other training source code dependencies aside from the entry point file. Structure within this directory will be preserved when training on SageMaker."
    },
    PyVersion:{
        "Type":"String",
        "Default":"py3",
        "AllowedValues":["py2","py3"],
        "Description":"Python version you want to use for executing your model training code."
    },
    TrainVolumeSize:{
        "Type":"Number",
        "Default":"10",
        "MinValue":"10",
        "Description":"Size in GB of the EBS volume to use for storing input data during training. Must be large enough to store training data if input_mode='File' is used (which is the default)."
    },
    TrainMaxRun:{
        "Type":"Number",
        "Default":"4",
        "Description":"Timeout in hours for training, after which Amazon SageMaker terminates the job regardless of its current status."
    },
    InputMode:{
        "Type":"String",
        "Default":"File",
        "AllowedValues":["Pipe","File"],
        "Description":"The input mode that the algorithm supports. Valid modes: 'File' - Amazon SageMaker copies the training dataset from the s3 location to a directory in the Docker container. 'Pipe' - Amazon SageMaker streams data directly from s3 to the container via a Unix named pipe."
    },
    HostEntryPoint:{
        "Type":"String",
        "Default":"NONE",
        "Description":"Path (absolute or relative) to the Python file which should be executed as the entry point to model hosting."
    },
    HostSourceFile:{
        "Type":"String",
        "Default":"NONE",
        "Description":"Optional. Path (absolute or relative) to a directory with any other training source code dependencies aside from tne entry point file. Structure within this directory will be preserved when training on SageMaker."
    },
    EnableCloudwatchMetrics:{
        "Type":"String",
        "Default":"false",
        "AllowedValues":["true","false"],
        "Description":"Optional. If true, training and hosting containers will generate Cloudwatch metrics under the AWS/SageMakerContainer namespace."
    },
    ContainerLogLevel:{
        "Type":"String",
        "Default":"200",
        "AllowedValues":["200","300","400","500"],
        "Description":"Log level to use within the container. Valid values are defined in the Python logging module."
    },
    TrainingSteps:{
        "Type":"Number",
        "Default":"1000",
        "MinValue":"1",
        "Description":"Perform this many steps of training. None, means train forever."
    },
    EvaluationSteps:{
        "Type":"Number",
        "Default":"100",
        "MinValue":"1",
        "Description":"Perform this many steps of evaluation. None, means that evaluation runs until input from "
    },
    RequirementsFile:{
        "Type":"String",
        "Default":"NONE",
        "Description":"Path to a requirements.txt file. The path should be within and relative to source_dir. This is a file containing a list of items to be installed using pip install. Details on the format can be found in the Pip User Guide."
    },
    "HyperParameters":{
        "Type":"String",
        "Default":"{}",
        "Description":"Hyperparameters that will be used for training. Will be made accessible as a dict[str, str] to the training code on SageMaker. For convenience, accepts other types besides str, but str() will be called on keys and values to convert them before training."
    },
    "ModelHostingEnvironment":{
        "Type":"String",
        "Default":"{}",
        "Description":"Environment variables to run with image when hosted in SageMaker."
    },
    "ConfigPresetType":{
        "Type":"String",
        "Default":"CUSTOM",
        "AllowedValues":configs
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
    },
    "ModelConfigLambda":{
        "Type":"String",
        "Default":"EMPTY"
    }
}
