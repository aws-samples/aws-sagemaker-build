var fs=require('fs')
var _=require('lodash')

module.exports={
  "Parameters":{
    "AssetBucket":{
        "Type":"String",
    },
    "AssetPrefix":{
        "Type":"String",
    },
  },
  "Conditions":{},
  "Outputs":{},
  "Resources":Object.assign(
    require('./activo')
  ),
  "AWSTemplateFormatVersion": "2010-09-09",
  "Description": "",
}
