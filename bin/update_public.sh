#! /bin/bash

BUCKET="sagebuild"
REGION="us-east-1"
cd ../sagebuild
make

aws s3 cp ./build/template.json s3://$BUCKET

TEMPLATE="http://s3.amazonaws.com/$BUCKET/template.json"
URL="https://console.aws.amazon.com/cloudformation/home?region=$REGION#/stacks/new?stackName=SageBuild&templateURL=$TEMPLATE"

echo "$URL"
