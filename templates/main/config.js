var base=require('../../config')

module.exports=Object.assign(base,{
    name:"main",
    parameters:{
        "AssetBucket":base.templateBucket,
        "AssetPrefix":base.templatePrefix,
        "VPCConfiguration":"CreateVPC",
        "VPCSubnets":"subnet-089053fd9176c83c0,subnet-090930421177b009e"
    }
})
