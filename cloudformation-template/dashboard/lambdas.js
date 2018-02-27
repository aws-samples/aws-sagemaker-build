var fs=require('fs')
var _=require('lodash')
var util=require('./util')

    
var lambdas=[]
_.forEach(require('../step_function/lambdas'),(value,key)=>{
    if(value.Type==='AWS::Lambda::Function'){
        lambdas.push(key)
    }
})


module.exports=function(main_offset){
    var Lambda_title=util.Title("## Step Function Lambdas ",main_offset+6)

    var lambda_widgets=lambdas
        .map(util.lambda)
        .map(util.place(main_offset+6+Lambda_title.height))
    return _.flatten([Lambda_title,lambda_widgets])
}


