var fs=require('fs')
var Promise=require('bluebird')
var _=require('lodash')

module.exports={
    "SageBuildNotebookDirectory":{
        "Type": "Custom::SageMakerNotebook",
        Condition:"NoteBookInstance",
        "DependsOn":["CFNLambdaPolicy"],
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["JupyterApiProxyLambda", "Arn"] },
            notebook:{"Fn::If":[
                "InternalNoteBookInstance",
                {"Ref":"SageMakerNotebookInstance"},
                {"Ref":"ExternalNotebook"} 
            ]},
            create:{
                InstanceName:{"Fn::GetAtt":["Notebook","Name"]},
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
        Condition:"NoteBookInstance",
        "DependsOn":["CFNLambdaPolicy","SageBuildNotebookDirectory"],
        "Properties": {
            "ServiceToken": { "Fn::GetAtt" : ["JupyterApiProxyLambda", "Arn"] },
            notebook:{"Fn::If":[
                "InternalNoteBookInstance",
                {"Ref":"SageMakerNotebookInstance"},
                {"Ref":"ExternalNotebook"} 
            ]},
            create:{
                InstanceName:{"Fn::GetAtt":["Notebook","Name"]},
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
