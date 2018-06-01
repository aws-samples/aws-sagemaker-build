import json
import os
def handler(event,context):
    print(json.dumps(event,indent=2))
    return {
      "ProductionVariants": [{
          "InitialInstanceCount":os.environ["HOSTINSTANCECOUNT"], 
          "InstanceType":os.environ["HOSTINSTANCETYPE"],
          "ModelName":event["name"], 
          "VariantName":"prod", 
        }]
    } 
