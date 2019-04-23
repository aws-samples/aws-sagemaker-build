#! /bin/bash
__dirname="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
export AWS_PROFILE=$(node -e "console.log(require('$__dirname'+'/../config').profile)")
export AWS_DEFAULT_REGION=$(node -e "console.log(require('$__dirname'+'/../config').region)")

BUCKET=$(node -e "console.log(require('$__dirname'+'/../config').templateBucket)")
PREFIX=$(node -e "console.log(require('$__dirname'+'/../config').templatePrefix)")

BLUE=$(tput setaf 4)
RESET=$(tput sgr0)
echo bootstrap bucket is $BLUE$BUCKET/$PREFIX$RESET

aws s3 sync $__dirname/../build s3://$BUCKET/$PREFIX

PUBLIC="http://s3.amazonaws.com/$BUCKET/$PREFIX/templates/main.json"

echo "console launch url:"
echo "https://console.aws.amazon.com/cloudformation/home?region=$AWS_DEFAULT_REGION#/stacks/create/review?stackName=SageBuild&templateURL=$PUBLIC&param_AssetBucket=$BUCKET&param_AssetPrefix=$PREFIX&param_Username=Admin"

