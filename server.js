var http = require('http');
var fs = require('fs');
var path = require('path');//提供了文件系统路径相关的功能
var mime = require('mime');//此模块有根据文件扩展名得出MIME类型的功能
var cache = {};//用来缓存文件内容的对象

//请求文件不存在时发送404错误
function send404(response) {
	response.writeHead(404, {'Content-Type' : 'text/plain'});
	response.write('Error 404: resource not found.');
	response.end();
}

//文件数据服务
function sendFile(response, filePath, fileContents) {
	response.writeHead(200, {'Content-Type': mime.lookup(path.basename(filePath))});
	response.end(fileContents);
}

//提供静态文件服务
function serveStatic(response, cache, absPath) {
	if(cache[absPath]) {//检查文件是否在内存中，如果在则返回
		sendFile(response, absPath, cache[absPath]);
	} else {
		fs.exists(absPath, function(exists) {//检查文件是否存在
			if(exists) {
				fs.readFile(absPath, function(err, data) {//从硬盘中读取文件
					if(err) {
						send404(response);
					} else {
						cache[absPath] = data;
						sendFile(response, absPath, data);//从硬盘中读取文件并返回
					}
				});
			} else {
				send404(response);
			}
		});
	}
}

//创建HTTP服务器
var server = http.createServer(function(request, response) {
	var filePath = false;
	if(request.url == '/') {
		filePath = 'public/index.html';
	} else {
		filePath = 'public' + request.url;
	}
	var absPath = './' + filePath;
	serveStatic(response, cache, absPath);//返回静态文件
});
server.listen(8888, function() {
	console.log('Server listening on port 8888.');
});

var chatServer = require('./lib/chat_server');
chatServer.listen(server);