# AWS SageMaker Build
Creates a CloudFormation template that uses AWS StepFunctions to automate the building and training of Sagemaker custom models based on S3 and GitHub events

## setup
```shell
node -e "console.log('Running Node.js ' + process.version)"
. ~/.nvm/nvm.sh
nvm install 8
npm install aws-sdk lodash
npm install
npm run up
```
create an s3 bucket. [instructions](https://docs.aws.amazon.com/AmazonS3/latest/dev/create-bucket-get-location-example.html). open up config.json and set templateBucket to the name of your s3 bucket.

## Stack Management
```shell
npm run up #launches stack with default paramters
```
```shell
npm run update #updates the launched stack
```
```shell
npm run down #shuts down stack
```

template is written to /cloudformation-template/build/template.json

