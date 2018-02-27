#!/usr/bin/env python
import boto3

cf = boto3.client('cloudformation')
sns = boto3.client('sns')
step=boto3.client('stepfunctions')

StackName='SageBuild-40'
#Get outputs from build stack
result=cf.describe_stacks(
    StackName=StackName
)
outputs={}
for output in result['Stacks'][0]['Outputs']:
    outputs[output['OutputKey']]=output['OutputValue']

#Start an execution through sns
result=sns.publish(
    TopicArn=outputs['LaunchTopic'],
    Message="start"
)

