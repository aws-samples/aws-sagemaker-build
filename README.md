# SageBuild
code for aws blog post

## setup

```shell
npm install
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


template is written to /template/template.json
