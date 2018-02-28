
exports.handler=(event,context,cb)=>{
    console.log("EVENT:",JSON.stringify(event,null,2))
    var date=new Date()

    event.timestamp=`${date.getFullYear().toString()}-${date.getMonth()+1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}-${date.getMilliseconds}`

    event.name=`${event.StackName}-${event.timestamp}`
    cb(null,event)
}
