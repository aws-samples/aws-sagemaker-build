#! /bin/bash
set -ex 
cd /home/ec2-user

cd SageMaker
mkdir -p SageBuild
cd SageBuild
aws s3 cp s3://${AssetBucket}/sagebuild/notebooks.zip .
unzip notebooks.zip 
echo '{"Region":"${AWS::Region}","StackName":"${AWS::StackName}"}' > config.json

cd ..
chown "ec2-user" SageBuild --recursive 
