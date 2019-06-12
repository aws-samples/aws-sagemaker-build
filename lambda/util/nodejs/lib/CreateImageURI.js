var _=require('lodash')

exports.pytorch=function(params){
    var account='520713654638'
    var instance=params.traininstancetype.split('.')[1][0]==="p" ? "gpu" : "cpu"
    return `${account}.dkr.ecr.${process.env.AWS_REGION}.amazonaws.com/sagemaker-pytorch:${params.frameworkversion}-${instance}-${params.pyversion}`
}

exports.scikit=function(params){
    var account={
            "us-east-1":"746614075791",
            "us-west-2":"246618743249",
            "eu-west-1":"683313688378",
            "us-east-2":"257758044811",
            "us-gov-west-1":"414596584902",
            "ap-northeast-1":"354813040037",
            "ap-northeast-2":"366743142698",
            "ap-south-1":"720646828776",
            "ap-southeast-1":"121021644041",
            "ap-southeast-2":"783357654285",
            "ca-central-1":"341280168497",
            "eu-central-1":"492215442770",
            "eu-west-1":"141502667606",
            "eu-west-2":"764974769150"
        }[process.env.AWS_REGION]
    var instance=params.traininstancetype.split('.')[1][0]==="p" ? "gpu" : "cpu"
    return `${account}.dkr.ecr.${process.env.AWS_REGION}.amazonaws.com/sagemaker-chainer:${params.frameworkversion}-${instance}-${params.pyversion}`
}

exports.scikit=function(params){
    var account='683313688378'
    var instance=params.traininstancetype.split('.')[1][0]==="p" ? "gpu" : "cpu"
    return `${account}.dkr.ecr.${process.env.AWS_REGION}.amazonaws.com/sagemaker-scikit-learn:${params.frameworkversion}-${instance}-${params.pyversion}`
}

exports.tensorflow=function(params){
    var account='520713654638'
    var instance=params.traininstancetype.split('.')[1][0]==="p" ? "gpu" : "cpu"
    return `${account}.dkr.ecr.${process.env.AWS_REGION}.amazonaws.com/sagemaker-tensorflow:${params.frameworkversion}-${instance}-${params.pyversion}`
}

exports.mxnet=function(params){
    var account='520713654638'
    var instance=params.traininstancetype.split('.')[1][0]==="p" ? "gpu" : "cpu"
    return `${account}.dkr.ecr.${process.env.AWS_REGION}.amazonaws.com/sagemaker-mxnet:${params.frameworkversion}-${instance}-${params.pyversion}`
}

exports.amazon=function(params){
    var algorithm=params.algorithm.toLowerCase()
    console.log(algorithm,process.env.AWS_REGION)
    if(["ipinsights","knn","object2vec","kmeans","pca", "factorization-machines","linear-learner", "ntm", "randomcutforest"].includes(algorithm)){
        var account={
            "us-west-2":"174872318107",
            "us-east-1":"382416733822",
            "us-east-2":"404615174143",
            "eu-west-1":"438346466558",
            "ap-northeast-1":"351501993468",
            "us-gov-west-1":"226302683700",
            "ap-northeast-2":"835164637446",
            "ap-south-1":"991648021394",
            "ap-southeast-1":"475088953585",
            "ap-southeast-2":"712309505854",
            "ca-central-1":"469771592824",
            "eu-central-1":"664544806723",
            "eu-west-1":"438346466558",
            "eu-west-2":"644912444149"
        }[process.env.AWS_REGION]
    }else if(params.algorithm==="lda"){
        var account={
            "us-west-2":"999678624901",
            "us-east-1":"766337827248",
            "us-east-2":"999911452149",
            "eu-west-1":"266724342769",
            "us-gov-west-1":"226302683700",
            "ap-northeast-1":"258307448986",
            "ap-northeast-2":"293181348795",
            "ap-south-1":"991648021394",
            "ap-southeast-1":"475088953585",
            "ap-southeast-2":"297031611018",
            "ca-central-1":"469771592824",
            "eu-central-1":"353608530281",
            "eu-west-1":"999678624901",
            "eu-west-2":"644912444149"
        }[process.env.AWS_REGION]
    }else if(["object-detection","semantic-segmentation","xgboost","image-classification","seq2seq","blazingtext"].includes(algorithm)){
        var account={
            "us-west-2":"433757028032",
            "us-east-1":"811284229777",
            "us-east-2":"825641698319",
            "eu-west-1":"685385470294",
            "ap-northeast-1":"501404015308",
            "us-gov-west-1":"226302683700",
            "ap-northeast-2":"306986355934",
            "ap-south-1":"991648021394",
            "ap-southeast-1":"475088953585",
            "ap-southeast-2":"544295431143",
            "ca-central-1":"469771592824",
            "eu-central-1":"813361260812",
            "eu-west-1":"685385470294",
            "eu-west-2":"644912444149"
        }[process.env.AWS_REGION]
    }else if(params.algorithm==="forecasting-deepar"){
        var account={
            "us-west-2":"156387875391",
            "us-east-1":"522234722520",
            "us-east-2":"566113047672",
            "eu-west-1":"224300973850",
            "ap-northeast-1":"633353088612",
            "us-gov-west-1":"226302683700",
            "ap-northeast-1":"633353088612",
            "ap-northeast-2":"204372634319",
            "ap-south-1":"991648021394",
            "ap-southeast-1":"475088953585",
            "ap-southeast-2":"514117268639",
            "ca-central-1":"469771592824",
            "eu-central-1":"495149712605",
            "eu-west-1":"224300973850",
            "eu-west-2":"644912444149"
        }[process.env.AWS_REGION]
    }else{
        console.log("did not find account")
    }
    return `${account}.dkr.ecr.${process.env.AWS_REGION}.amazonaws.com/${algorithm}:latest`
}
