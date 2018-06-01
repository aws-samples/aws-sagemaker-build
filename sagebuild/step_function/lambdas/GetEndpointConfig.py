import json

def handler(event,context):
    print(json.dumps(event,indent=2))
    return {
      "ProductionVariants": [{
          "InitialInstanceCount": 1, 
          "InstanceType": "ml.t2.medium",
          "ModelName":event["name"], 
          "VariantName":"prod", 
        }]
    } 
