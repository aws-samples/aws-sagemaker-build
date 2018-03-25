import json

def handler(event,context):
    print(json.dumps(event,indent=2))
    return {
      "AlgorithmSpecification": { 
        "TrainingImage":event["images"]["train"], 
        "TrainingInputMode": "File"
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
        "InstanceCount": 1, 
        "InstanceType": "ml.m4.xlarge" , 
        "VolumeSizeInGB": 1, 
      },
      "RoleArn":event["params"]["training"]["role"], 
      "StoppingCondition": { 
        "MaxRuntimeInSeconds": 600
      },
      "TrainingJobName":event["name"], 
      "HyperParameters": {},
      "Tags": []
    }
