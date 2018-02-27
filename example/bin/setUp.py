#!/usr/bin/env python
import boto3
import json
from subprocess import call as run

s3=boto3.resource('s3')
cf = boto3.client('cloudformation')

StackName='SageBuild-40'
with open('../../config.json') as json_data:
    config=json.load(json_data)

#Get outputs from build stack
result=cf.describe_stacks(
    StackName=StackName
)
outputs={}
for output in result['Stacks'][0]['Outputs']:
    outputs[output['OutputKey']]=output['OutputValue']

run("git remote set-url deploy {0} && git push deploy master".format(outputs['RepoUrl']),
    shell=True)

object = s3.Object('sagebuild-40-databucket-5yh5ydjmwxby','train/data.csv')
with open('../data/iris.csv') as data:
    object.put(Body=data)

