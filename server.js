var fs = require('fs');
var path = require('path');
var http = require('http');

var MIME = {
	'.css':'text/css',
	'.js':'application/javascript'
	};

function combineFiles(pathnames,callback){
	var output = [];

	(function next(i,len){
	 	if(i < len){
			fs.readFile(pathnames[i],function(err,data){
					if(err)
					{
						callback(err);
					}
					else
					{
						output.push(data);
						next(i+1,len);
					}
				});
		}
		else
		{
			 callback(null, Buffer.concat(output));
		}
	 }(0,pathnames.length));
}

function main(){
	console.log('hello');
		var	root = '.',
		port = 3000;
	http.createServer(function (req,res){
				var urlInfo = parseURL(root,req.url);
				console.log(urlInfo);
				combineFiles(urlInfo.pathnames,function(err,data){
					if(err)
					{
						res.writeHead(404);
						res.end(err.message);
					}
					else
					{
						res.writeHead(200,{
							'Content-Type':urlInfo.mine
							});
						res.end(data);
					}
					});
			}).listen(3000,function(){
					console.log("running on 3000");
				});
}

function parseURL(root,url){
	var base,pathnames,parts;
	console.log(url);
	if(url.indexOf('??')===-1)
	{
		url = url.replace('/','/??');
	}

	parts = url.split('??');
	base = parts[0];
	pathnames = parts[1].split(',').map(function(value){
				return path.join(root,base,value);
			});
	console.log(url);
	return {
		mime:MIME[path.extname(pathnames[0])] || 'text/plain',
		pathnames:pathnames
	}
	console.log(process.argv);
	console.log('hello');
}

main();
