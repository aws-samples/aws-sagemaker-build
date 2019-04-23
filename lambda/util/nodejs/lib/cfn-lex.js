var _=require('lodash')

if (require.main === module) {
    var text=process.argv[2]
    exports.clean(text)
}

exports.clean=function clean(name,inc){
    var map={
        '0':'zero',
        '1':'one',
        '2':'two',
        '3':'three',
        '4':'four',
        '5':'five',
        '6':'six',
        '7':'seven',
        '8':'eight',
        '9':'nine',
        '-':'_',
    }
    var out=name.replace(/([0-9])/g,x=>map[x])
    if(!inc){
        var a="a".charCodeAt(0)
        var z="z".charCodeAt(0)
        var current=out.match(/.*_(.)/)[1].charCodeAt(0)
        current++
        var index=String.fromCharCode((current-a)%(z-a)+a)
    }else{
        var index=inc
    }
    var tmp=out.replace(/-/g,'_').split('_')
    tmp.pop()
    tmp.push(index) 
    var out=tmp.join('_')
    console.log(out)
    return out
}
