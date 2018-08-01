module.exports={
    "CodeBucket":{
        "Value":{"Ref":"CodeBucket"}
    },
    "TrainingRoleArn":{
        "Value":{"Fn::GetAtt":["TrainingRole","Arn"]}
    },
    "TrainingRole":{
        "Value":{"Ref":"TrainingRole"}
    },
    "ModelRole":{
        "Value":{"Ref":"ModelRole"}
    },
    "AlexaLambdaArn":{
        "Value":{"Fn::GetAtt":["AlexaLambda","Arn"]},
        "Description":"Lambda function for creating an alexa skill"
    },
    "ParameterStore":{
        "Value":{"Ref":"ParameterStore"}
    },
    "NoteBookUrl":{
        "Value":{"Fn::If":[
            "NoteBookInstance",
            {"Fn::Sub":"https://console.aws.amazon.com/sagemaker/home?region=${AWS::Region}#/notebook-instances/openNotebook/${Notebook.Name}"},
            "EMPTY" 
        ]},
        "Description":"AWS Console url of your sagemaker notebook instance, from here you can open the instance"
    },
    "NoteBookInstance":{
        "Value":{"Fn::If":[
            "NoteBookInstance",
            {"Fn::Sub":"https://console.aws.amazon.com/sagemaker/home?region=${AWS::Region}#/notebook-instances/${Notebook.Name}"},
            "EMPTY" 
        ]},
        "Description":"AWS Console url of your sagemaker notebook instance, from here you can open the instance"
    },
    "NoteBookInstanceName":{
        "Value":{"Fn::If":[
            "NoteBookInstance",
            {"Fn::Sub":"${Notebook.Name}"},
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
    "ModelConfigLambda":{
        "Value":{"Fn::Sub":"${LambdaVariables.ModelConfig}"},
        "Description":"Lambda function that returns Model Configuration"
    },
    "RepoUrl":{
        "Value":{"Fn::GetAtt":["Variables","RepoUrl"]},
        "Description":"CodeCommit repo to put Dockerfile code in, will automatically trigger a new build"
    },
    "StepFunctionConsole":{
        "Value":{"Fn::Sub":"https://console.aws.amazon.com/states/home?region=${AWS::Region}#/statemachines/view/${StateMachine}"},
        "Description":"AWS Console for the StepFunction StateMachine that controls the build"
    }
}
