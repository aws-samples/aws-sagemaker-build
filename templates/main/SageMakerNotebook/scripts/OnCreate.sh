#! /bin/bash
set -ex 
cd /home/ec2-user

cd SageMaker
mkdir -p SageBuild
cd SageBuild
aws s3 cp s3://${AssetBucket}/${AssetPrefix}/notebooks.zip .
unzip notebooks.zip 
rm notebooks.zip
echo '{"Region":"${AWS::Region}","StackName":"${AWS::StackName}"}' > config.json

for notebook in $(find . | grep .ipynb); do
    jupyter trust $notebook
done

cd ..
chown "ec2-user" SageBuild --recursive 
