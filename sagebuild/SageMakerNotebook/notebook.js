var package=require('../../package')
var fs=require('fs')

var notebook=JSON.parse(fs.readFileSync(`${__dirname}/notebook.ipynb`))
module.exports=notebook
 
