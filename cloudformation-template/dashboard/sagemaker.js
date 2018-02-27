var fs=require('fs')
var _=require('lodash')
var util=require('./util')

    
module.exports=function(main_offset){
    var title=util.Title("## SageMaker Endpoint",main_offset+6)
    return _.flatten([
        title,
        [endpoint('prod')].map(util.place(main_offset+6+title.height))
    ])
}


function endpoint(name){
    return {
        "type": "metric",
        "properties": {
            "view": "timeSeries",
            "stacked": false,
            "metrics": [
                [ "/aws/sagemaker/Endpoints", "CPUUtilization", "EndpointName", "${AWS::StackName}", "VariantName", name, { "yAxis": "right" } ],
                [ ".", "MemoryUtilization", ".", ".", ".", "." ]
            ],
            "region": "${AWS::Region}"
        }
    }
}


