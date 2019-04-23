var _=require('lodash')

module.exports=function(domain,aws,opts){
    console.log(JSON.stringify(opts,null,2),domain)
    try{
        return new Promise(function(res,rej){
            var endpoint = new aws.Endpoint(domain);
            endpoint.port="8182"
            endpoint.protocol="http"
            var request = new aws.HttpRequest(endpoint, aws.config.region);
            aws.config.getCredentials(()=>{
                var credentials = aws.config.credentials
                
                request.method=opts.method
                request.path=opts.path
                if(opts.body){
                    request.body=JSON.stringify(opts.body)
                }
                request.headers['Host'] = domain;
                request.headers['Content-Type'] = _.get(opts,"Content-Type",'application/x-www-form-urlencoded');
                request.headers['Accept'] = _.get(opts,"Accept",'application/json');
                
                var signer = new aws.Signers.V4(request,"neptune-db");
                signer.addAuthorization(credentials, new Date());
                
                var client = new aws.HttpClient();
                client.handleRequest(request, null, function(response) {
                    console.log(response.statusCode + ' ' + response.statusMessage);
                    var responseBody = '';
                    response.on('data', function (chunk) {
                        responseBody += chunk;
                    });
                    response.on('error', function (error) {
                        rej(error)
                    });

                    response.on('end', function (chunk) {
                        console.log('Response body: ' + responseBody);
                        var response=JSON.parse(responseBody)
                        console.log(JSON.stringify(response))
                        if(_.get(response,"status.code")===200){
                            res(response.result) 
                        }else if(_.get(response,"status")==='200 OK'){
                            res(response)
                        }else{
                            rej(response)
                        }
                    });
                },function(error) {
                        console.log('Error: ' + error);
                        rej(error)
                    }
                );
            })
        })
    }catch(e){
        console.log(e)
        return new Promise((res,rej)=>rej(e))
    }
}   
