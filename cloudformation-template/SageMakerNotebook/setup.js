var fs=require('fs')
var Promise=require('bluebird')
var _=require('lodash')

module.exports={
    "SageBuildNotebookDirectory":{
        "Type": "Custom::SageMakerNotebook",
        Condition:"LaunchNoteBookInstance",
        "DependsOn":["CFNLambdaPolicy","SageMakerNotebookInstance"],
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["JupyterApiProxyLambda", "Arn"] },
            create:{
                InstanceName:{"Ref":"AWS::StackName"},
                path:'/api/contents/SageBuild',
                method:'PUT',
                body:JSON.stringify({
                    name:"SageBuild",
                    type:"directory",
                })
            }
        }
    },
    "SageBuildNotebookTutorial":{
        "Type": "Custom::SageMakerNotebook",
        Condition:"LaunchNoteBookInstance",
        "DependsOn":["CFNLambdaPolicy","SageBuildNotebookDirectory","SageMakerNotebookInstance"],
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["JupyterApiProxyLambda", "Arn"] },
            create:{
                InstanceName:{"Ref":"AWS::StackName"},
                path:'/api/contents/SageBuild/tutorial.ipynb',
                method:'PUT',
                body:{"Fn::Sub":JSON.stringify({
                    name:"tutorial.ipynb",
                    type:"notebook",
                    content:require('./notebook')
                })}
            }
        }
    }
}
