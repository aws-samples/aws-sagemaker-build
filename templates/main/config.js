var base=require('../../config')

module.exports=Object.assign(base,{
    name:"main",
    parameters:{
        "AssetBucket":base.templateBucket,
        "AssetPrefix":base.templatePrefix,
        "VPCConfiguration":"CreateVPC"
    }
})
