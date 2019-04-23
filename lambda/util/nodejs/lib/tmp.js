var _=require('lodash')
var data=require('./tmp.json')
var parse=require('./gremlin-parse')
console.log(JSON.stringify(parse(data.data),null,2))
//console.log(JSON.stringify(data.data,null,2))



