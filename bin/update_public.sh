#! /bin/bash
__dirname="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

BUCKET=$(node -e "console.log(require('$__dirname'+'/../config').templateBucket)")
PREFIX=$(node -e "console.log(require('$__dirname'+'/../config').templatePrefix)")
REGION=$(node -e "console.log(require('$__dirname'+'/../config').region)")
make -C $__dirname/../sagebuild
ls
aws s3 sync $__dirname/../sagebuild/build s3://$BUCKET/$PREFIX

TEMPLATE="http://s3.amazonaws.com/$BUCKET/$PREFIX/template.json"
URL="https://console.aws.amazon.com/cloudformation/home?region=$REGION#/stacks/new?stackName=SageBuild&templateURL=$TEMPLATE"

echo "$URL"
