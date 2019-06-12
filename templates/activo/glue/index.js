var _=require('lodash')

module.exports=Object.assign({
    "DataCatalog":{
        "Type" : "AWS::Glue::Database",
        "Properties" : {
            DatabaseInput:{},
            CatalogId:{"Ref":"AWS::AccountId"}
        }
    },
    "CrawlerRole":{
		"Type": "AWS::IAM::Role",
		"Properties": {
			"AssumeRolePolicyDocument": {
				"Version": "2012-10-17",
				"Statement": [
					{
						"Effect": "Allow",
						"Principal": {
							"Service": [
								"glue.amazonaws.com"
							]
						},
						"Action": [
							"sts:AssumeRole"
						]
					}
				]
			},
			"Path": "/",
            "ManagedPolicyArns":[ 
                "arn:aws:iam::aws:policy/service-role/AWSGlueServiceRole"
            ],
			"Policies": [
				{
					"PolicyName": "root",
					"PolicyDocument": {
						"Version": "2012-10-17",
						"Statement": [
							{
								"Effect": "Allow",
								"Action": "s3:*",
								"Resource": "*"
							}
						]
					}
				}
			]
		}
    }
},
    require('./jobs'),require('./crawlers')
)
