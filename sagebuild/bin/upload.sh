#! /bin/bash
__dirname="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

export AWS_PROFILE=$(node -e "console.log(require('$__dirname'+'/../../config').profile)")
export AWS_DEFAULT_REGION=$(node -e "console.log(require('$__dirname'+'/../../config').region)")

BUCKET=$(node -e "console.log(require('$__dirname'+'/../../config').templateBucket)")
PREFIX=$(node -e "console.log(require('$__dirname'+'/../../config').templatePrefix)")

BLUE=$(tput setaf 4)
RESET=$(tput sgr0)
echo bootstrap bucket is $BLUE$BUCKET/$PREFIX$RESET

aws s3 sync $__dirname/../build/ s3://$BUCKET/$PREFIX/ --delete  
