var _=require('lodash')

module.exports=Object.assign({
    "SageBuild":{
        "Type" : "AWS::CloudFormation::Stack",
        "Properties" : {
            TemplateURL:{"Fn::Sub":
                "https://s3.amazonaws.com/${AssetBucket}/${AssetPrefix}/templates/main.json"},
            Parameters:{
                "AssetBucket":{"Ref":"AssetBucket"},
                "AssetPrefix":{"Ref":"AssetPrefix"},
                "NoteBookInstanceType":"NONE"
            }
        }
    },
},{}
)
