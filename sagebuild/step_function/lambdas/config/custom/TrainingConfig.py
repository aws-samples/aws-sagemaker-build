import json
import os
def handler(event,context):
    print(json.dumps(event,indent=2))
    return {
      "AlgorithmSpecification": { 
        "TrainingImage":event["images"]["train"], 
        "TrainingInputMode":os.environ["INPUTMODE"]
      },
      "InputDataConfig": [ 
        {
          "ChannelName": "training", 
          "DataSource": { 
            "S3DataSource": { 
              "S3DataType": "S3Prefix", 
              "S3Uri":f"s3://{event['Buckets']['Data']}/train/", 
              "S3DataDistributionType": "FullyReplicated" 
            }
          },
          "CompressionType": "None",
          "RecordWrapperType": "None" 
        },
      ],
      "OutputDataConfig": { 
        'S3OutputPath':f"s3://{event['Buckets']['Artifact']}", 
      },
      "ResourceConfig": { 
        "InstanceCount": os.environ["TRAINGINSTANCECOUNT"], 
        "InstanceType": os.environ["TRAININSTANCETYPE"], 
        "VolumeSizeInGB": int(os.environ["TRAINVOLUMESIZE"]), 
      },
      "RoleArn":event["params"]["training"]["role"], 
      "StoppingCondition": { 
        "MaxRuntimeInSeconds":parseInt(os.environ["TRAINMAXRUN"])*60*60
      },
      "TrainingJobName":event["name"], 
      "HyperParameters":JSON.parse(os.environ["HyperParameters"]),
      "Tags": []
    }
