var fs=require('fs')
var parse = require('csv-parse')
var stream=require('stream')
var zlib = require('zlib')

exports.clean=function run(file,fnc){
    var wstream = new stream.PassThrough()
    
    const parser = parse({
        delimiter: ',',
        skip_empty_lines:true,
        from_line:2
    })

    parser.on('readable', function(){
        let record
        while (record = parser.read()) {
            var out=fnc(record)
            if(out){
                wstream.write(JSON.stringify(out)+'\n')
            }
        }
    })

    parser.on('error', function(err){
        console.error(err.message)
        wstream.end()
    })

    parser.on('end', function(){
        wstream.end()
    })
    file.pipe(parser)
    var gzip = zlib.createGzip()
    return wstream.pipe(gzip)
}
