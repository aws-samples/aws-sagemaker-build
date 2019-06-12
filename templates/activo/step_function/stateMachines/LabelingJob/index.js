var fs=require('fs')
var _=require('lodash')

states={
    "Comment": "",
    "StartAt": "start",
    "States": {
        "start":{
            Type:"Pass",
            Next:"CreateManifest"
        },
        "CreateManifest":{
            Type:"Pass",
            Next:"CreateLabelingJob"
        },
        "CreateLabelingJob":{
            Type:"Pass",
            End:true
        },
    }
}

states.States=_.fromPairs(_.toPairs(states.States)
    .map(state=>{
        if(state[1].Type==="Task" || state[1].Type==="Parallel"){
            return addCatch(state)
        }else{
            return state
        }
    }))

function addCatch(state){
    if(state[0]!=="Error"){
        state[1].Catch=[{
            "ErrorEquals":["States.ALL"],
            "ResultPath":"$.error",
            "Next":"Error"
        }]
    }
    return state
}
module.exports=states


