import json
import os
def handler(event,context):
    print(json.dumps(event,indent=2))
    return {
      "ProductionVariants": [{
          "InitialInstanceCount":event["params"]["hostinstancecount"], 
          "InstanceType":event["params"]["hostinstancetype"],
          "ModelName":event["args"]["model"]["ModelName"], 
          "VariantName":"prod", 
        }]
    } 
