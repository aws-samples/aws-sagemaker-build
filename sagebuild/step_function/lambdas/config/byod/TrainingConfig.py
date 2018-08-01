import json
import os
def handler(event,context):
    print(json.dumps(event,indent=2))
    return {
      "AlgorithmSpecification": { 
        "TrainingImage":"{}.dkr.ecr.{}.amazonaws.com/{}:Training_v{}".format(
            event["params"]["accountid"],
            os.environ["AWS_REGION"],
            event["params"]["ecrrepo"],
            event["params"]["version"]
        ), 
        "TrainingInputMode":event["params"]["inputmode"]
      },
      "InputDataConfig": [ 
        {
          "ChannelName": "training", 
          "DataSource": { 
            "S3DataSource": { 
              "S3DataType": "S3Prefix", 
              "S3Uri":f"s3://{event['params']['databucket']}/train/", 
              "S3DataDistributionType": "FullyReplicated" 
            }
          },
          "CompressionType": "None",
          "RecordWrapperType": "None" 
        },
      ],
      "OutputDataConfig": { 
        'S3OutputPath':f"s3://{event['params']['artifactbucket']}", 
      },
      "ResourceConfig": { 
        "InstanceCount": event["params"]["traininstancecount"], 
        "InstanceType": event["params"]["traininstancetype"], 
        "VolumeSizeInGB": int(event["params"]["trainvolumesize"]), 
      },
      "RoleArn":event["params"]["trainingrole"], 
      "StoppingCondition": { 
        "MaxRuntimeInSeconds":int(event["params"]["trainmaxrun"])*60*60
      },
      "TrainingJobName":"{}-{}".format(event["params"]["name"],event["params"]["id"]), 
      "HyperParameters":event["params"]["hyperparameters"],
      "Tags": []
    }
