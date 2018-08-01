var fs=require('fs')
var _=require('lodash')
var util=require('./util')

    
module.exports=function(main_offset){
    var title=util.Title("## Step Function StateMachine",main_offset+6)
    
    return _.flatten([
        title,
        [time(),executions()].map(util.place(main_offset+6+title.height))
    ])
}


function time(){
return {
    "type": "metric",
    "properties": {
        "view": "timeSeries",
        "stacked": false,
        "metrics": [
            [ "AWS/States", "ExecutionTime", "StateMachineArn", "${StateMachine}" ]
        ],
        "region": "${AWS::Region}"
    }
}}

function executions(){
return {
    "type": "metric",
    "properties": {
        "view": "timeSeries",
        "stacked": true,
        "metrics": [
            [ "AWS/States", "ExecutionThrottled", "StateMachineArn", "${StateMachine}", { "stat": "Sum" } ],
            [ ".", "ExecutionsAborted", ".", ".", { "stat": "Sum" } ],
            [ ".", "ExecutionsFailed", ".", ".", { "color": "#d62728", "stat": "Sum" } ],
            [ ".", "ExecutionsSucceeded", ".", ".", { "color": "#2ca02c", "stat": "Sum" } ],
            [ ".", "ExecutionsTimedOut", ".", ".", { "stat": "Sum" } ]
        ],
        "region": "${AWS::Region}"
    }
}}
