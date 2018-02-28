#! /bin/bash

BUCKET="sagebuild"
cd ../cloudformation-template
make

aws s3 cp ./build/template.json s3://$BUCKET
