var fs=require('fs')
var _=require('lodash')
var stateMachines=require('./step_function/stateMachines')
var machines=stateMachines.machines

module.exports={
  "Parameters":{
    "AssetBucket":{
        "Type":"String",
    },
    "AssetPrefix":{
        "Type":"String",
    },
    "NumberOfHumanWorkersPerDataObject":{"Type":"String"},
    "PreHumanTaskLambdaArn":{"Type":"String"},
    "TaskTimeLimitInSeconds":{"Type":"String"},
    "UiTemplateS3Uri":{"Type":"String"},
    "WorkteamArn":{"Type":"String"},
    "MaxConcurrentTaskCount":{"Type":"String"},
    "TaskAvailabilityLifetimeInSeconds":{"Type":"String"},
    "MaxHumanLabeledObjectCount":{"Type":"String"},
    "MaxPercentageOfInputDatasetLabeled":{"Type":"String"},
  },
  "Conditions":{},
  "Outputs":{},
  "Resources":Object.assign(
    require('./cfn'),
    require('./step_function'),
    require('./lambda'),
    require('./sagebuild')
  ),
  "AWSTemplateFormatVersion": "2010-09-09",
  "Description": "",
}
