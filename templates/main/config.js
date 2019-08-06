var base=require('../../config')

module.exports=Object.assign(base,{
    name:"main",
    parameters:{
        "AssetBucket":base.templateBucket,
        "AssetPrefix":base.templatePrefix,
        "KMSKeyId":"c7063fa6-e3e2-4198-98ca-3dec1b33452f"
    }
})
