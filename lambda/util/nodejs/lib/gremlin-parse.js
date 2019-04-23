var _=require('lodash')

module.exports=function parse(obj){
    if(obj['@type']==="g:List"){
        return obj['@value'].map(parse)
    }else if(obj['@type']==="g:Map"){
        return _.mapValues(_.fromPairs(_.chunk(obj['@value'],2)),parse)
    }else if(obj['@type']==="g:Vertex"){
        var vertex=obj['@value'] 
        return Object.assign(
            _.pick(vertex,["id","label"]),
            _.mapValues(vertex.properties,x=>parse(x)[0])
        )
    }else if(obj['@type']==="g:Edge"){
        var edge=obj['@value'] 
        return Object.assign({
            id:edge.id,
            "in":edge.inV,
            out:edge.outV,
            label:edge.label
        },_.mapValues(edge.properties,x=>parse(x))
        )
    }else if (obj['@type']==="g:TraversalMetrics"){
        return parse(obj['@value'])
    }else if (obj['@type']==="g:Metrics"){
        return parse(obj['@value'])
    }else  if(obj['@type']==="g:Property"){
        return parse(obj['@value'].value)
    }else  if(obj['@type']==="g:VertexProperty"){
        return parse(obj['@value'].value)
    }else  if(obj['@type']==="g:Int64"){
        return parseInt(obj['@value'])
    }else  if(obj['@type']==="g:Int32"){
        return parseInt(obj['@value'])
    }else  if(obj['@type']==="g:Double"){
        return parseFloat(obj['@value'])
    }else if(_.isArray(obj)){
        return obj.map(parse)
    }else if(_.isString(obj)){
        return obj
    }else{
        console.log(obj)
        return obj
    }
}

