var fs = require('fs');
var path = require('path');
var http = require('http');

var MIME = {
	'.css':'text/css',
	'.js':'application/javascript'
	};

function main(argv){
	var config = JSON.parse(fs.readFileSync(argv[0]),'utf-8');
	var root = config.root || '.';
	var port = config.port || 3000;

	http.createServer(function(req,res){
		var urlInfo = parseURL(root,req.url);
		
		validateFiles(urlInfo.pathnames,function(err,pathnames){
			if(err)
			{
				res.writeHead(404);
				res.end(err.message);
			}
			else
			{
				res.writeHead(200,{
					'Content-Type':urlInfo.mime
				});
				outputFiles(pathnames,res);
			}
		});
		
	}).listen(port,function(){
		console.log('running on port 3000!!');
		});
}

function validateFiles(pathnames,callback){
	(function next(i,len){
		if(i < len){
			fs.stat(pathnames[i],function(err,stats){
				if(err)
				{
					callback(err);
				}
				else
				{
					i++;
					next(i+1,len);
				}
			});
		}
		else
		{
			callback(null,pathnames);
		}
	}(0,pathnames.length));
}

function outputFiles(pathnames,writer)
{
	(function next(i,len){
		if(i<len)
		{
			var reader = fs.createReadStream(pathnames[i]);
			reader.pipe(writer,{end:false});
			reader.on('end',function(){
				next(i+1,len);
			});
		}
		else
		{
			writer.end();
		}
	}(0,pathnames.length));
}

function parseURL(root, url) {
    var base, pathnames, parts;

    if (url.indexOf('??') === -1) {
        url = url.replace('/', '/??');
    }

    parts = url.split('??');
    base = parts[0];
    pathnames = parts[1].split(',').map(function (value) {
        return path.join(root, base, value);
    });

    return {
        mime: MIME[path.extname(pathnames[0])] || 'text/plain',
        pathnames: pathnames
    };
}

main(process.argv.slice(2));
