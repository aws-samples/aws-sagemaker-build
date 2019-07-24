var base=require('../../config')

module.exports=Object.assign(base,{
    name:"main",
    parameters:Object.assign(base.parameters,{
        "AssetBucket":base.templateBucket,
        "AssetPrefix":base.templatePrefix
    })
})
