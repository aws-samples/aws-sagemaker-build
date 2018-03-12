var handler=require('./handler').handler
process.env.STEPFUNCTION_ARN="arn:aws:states:us-east-1:613341023709:stateMachine:StateMachine-gZZHH4So3hHa"
process.env.START_TOPIC="arn:aws:sns:us-east-1:613341023709:SageBuild-84-LaunchTopic-FWV5RJWWCOKA"
handler({
    request:{
        type:"IntentRequest",
        intent:{
            name:"AMAZON.StopIntent"
        }
    }
},{},console.log)
