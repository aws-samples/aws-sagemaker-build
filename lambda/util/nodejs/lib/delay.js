module.exports=function(time){
    return function(x){
        return new Promise((res,rej)=>{
            setTimeout(res(x),time)
        })
    }
}
