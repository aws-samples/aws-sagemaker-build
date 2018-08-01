var fs=require('fs')
var _=require('lodash')
var lambdas=require('./lambdas')
var sagemaker=require('./sagemaker')
var steps=require('./steps')
var util=require('./util')

var widgets=[util.Title("# ${AWS::StackName} Dashboard",0)]

widgets=widgets.concat(sagemaker(util.yOffset(widgets)))
widgets=widgets.concat(steps(util.yOffset(widgets)))
widgets=widgets.concat(lambdas(util.yOffset(widgets)))

module.exports={widgets}
