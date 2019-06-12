var _=require('lodash')
var fs=require('fs')

var machines=fs.readdirSync(__dirname)
    .filter(x=>x!=='index.js')
    .map(x=>x.match(/(.*)/)[1])

exports.machines=machines

exports.StateMachine=_.fromPairs(machines.map(x=>[
        `StateMachine${x}`,
        {
            "Type": "AWS::StepFunctions::StateMachine",
            "Properties": {
                "DefinitionString":{"Fn::Sub":JSON.stringify(require(`./${x}`))},
                "RoleArn":{"Fn::GetAtt":["StepFunctionRole","Arn"]}
            }
        }
        ]
))
