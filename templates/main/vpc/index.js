module.exports={
    InternalVPC:{
        "Type" : "AWS::EC2::VPC",
        Condition:"CreateVPC",
        "Properties" : {
            CidrBlock:"10.0.0.0/16",
            EnableDnsHostnames:true,
            EnableDnsSupport:true,
        }
    },
    Subnet1:{
        "Type" : "AWS::EC2::Subnet",
        Condition:"CreateVPC",
        "Properties" : {
            CidrBlock:"10.0.0.0/24",
            MapPublicIpOnLaunch:true,
            AvailabilityZone:{"Fn::Select":["0",{"Fn::GetAZs":""}]},
            VpcId:{"Ref":"InternalVPC"}
        }
    },
    Subnet2:{
        "Type" : "AWS::EC2::Subnet",
        Condition:"CreateVPC",
        "Properties" : {
            CidrBlock:"10.0.1.0/24",
            MapPublicIpOnLaunch:true,
            AvailabilityZone:{"Fn::Select":["1",{"Fn::GetAZs":""}]},
            VpcId:{"Ref":"InternalVPC"}
        }
    },
    RouteTable:{
        Type: "AWS::EC2::RouteTable",
        Condition:"CreateVPC",
        Properties:{
            VpcId:{"Ref":"InternalVPC"}
        }
    },
    Subnet1RouteTableAssociation:{
        Type: "AWS::EC2::SubnetRouteTableAssociation",
        Condition:"CreateVPC",
        Properties:{
            RouteTableId:{"Ref":"RouteTable"},
            SubnetId:{"Ref":"Subnet1"}
        }
    },
    Subnet2RouteTableAssociation:{
        Type: "AWS::EC2::SubnetRouteTableAssociation",
        Condition:"CreateVPC",
        Properties:{
            RouteTableId:{"Ref":"RouteTable"},
            SubnetId:{"Ref":"Subnet2"}
        }
    },
    "S3Endpoint" : {
       "Type" : "AWS::EC2::VPCEndpoint",
        Condition:"CreateVPC",
       "Properties" : {
          "PolicyDocument" : {
             "Version":"2012-10-17",
             "Statement":[{
                "Effect":"Allow",
                "Principal": "*",
                "Action":["s3:*"],
                "Resource":[
                    {"Fn::Sub":"arn:aws:s3:::${Variables.DataBucket}/*"},
                    {"Fn::Sub":"arn:aws:s3:::${Variables.DataBucket}"},
                    {"Fn::Sub":"arn:aws:s3:::${AssetBucket}/*"},
                    {"Fn::Sub":"arn:aws:s3:::${AssetBucket}"},
                    {"Fn::Sub":"arn:aws:s3:::${CodeBucket}/*"},
                    {"Fn::Sub":"arn:aws:s3:::${CodeBucket}"},
                    {"Fn::Sub":"arn:aws:s3:::${ArtifactBucket}/*"},
                    {"Fn::Sub":"arn:aws:s3:::${ArtifactBucket}"}
                ]
             }]
       },
       "RouteTableIds" : [ {"Ref" : "RouteTable"}],
       "ServiceName" : { "Fn::Sub": "com.amazonaws.${AWS::Region}.s3" },
       "VpcId" : {"Ref" : "InternalVPC"}
     }
    },
    "TrainingSecurityGroup":{
	   "Type" : "AWS::EC2::SecurityGroup",
        Condition:"UseVPC",
	   "Properties" : {
		  "GroupDescription" : "Allow traffic between notebook instances",
		  "VpcId" : {"Fn::GetAtt":["Variables","VPC"]},
	   }
	},
    "InstanceSecurityGroup":{
	   "Type" : "AWS::EC2::SecurityGroup",
        Condition:"UseVPC",
	   "Properties" : {
		  "GroupDescription" : "Allow traffic to Notebook Instance",
		  "VpcId" : {"Fn::GetAtt":["Variables","VPC"]},
	   }
	},
	"InboundRule": {
      "Type": "AWS::EC2::SecurityGroupIngress",
      Condition:"UseVPC",
      "Properties":{
         "IpProtocol": "tcp",
         "FromPort": 0,
         "ToPort": 65535,
         "SourceSecurityGroupId": {
           "Fn::GetAtt": [
             "TrainingSecurityGroup",
             "GroupId"
            ]
         },
         "GroupId": {
            "Fn::GetAtt": [
              "TrainingSecurityGroup",
              "GroupId"
            ]
         }
      }
   }
}
