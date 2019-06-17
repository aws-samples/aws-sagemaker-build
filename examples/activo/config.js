var base=require('../../config')

module.exports=Object.assign(base,{
    name:"examaple-activo",
    parameters:{
        "AssetBucket":base.templateBucket,
        "AssetPrefix":base.templatePrefix,
    }
})
