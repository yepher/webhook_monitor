var io = require('socket.io'),
    connect = require('connect'),
    snooper = require('snooper');
var http = require('http');
var qs = require('querystring');

var websocktPort = 3000;
var serverPort = 8080;

var app = connect().use(connect.static('public')).listen(websocktPort);

var webhook_room = io.listen(app, { log: false });

snooper.set_sockets(webhook_room.sockets);

webhook_room.sockets.on('connection', function (socket) {
    snooper.connect_snooper({
        socket: socket,
        username: socket.id
    });
});

http.createServer(function (request, response) {
    
    var host = request.headers.host + '/';
    host = host.replace("8080", "3000");
    
    var formOutput = '<html><body>'
        + '<h1>WebHook Landing Page</h1>'
        + 'View your data <a href="' + host + '?hookId=' + request.url.substring(1) + '">here</a><br>'
        + 'Listeners: ' + webhook_room.sockets.clients(request.url).length
        + '</body></html>';
    
    
    var requestData = {  };
    requestData.body = '';
    
    //console.log(request);
    
    // Build up the object that will be sent to clients via websocket
    requestData.date = new Date();
    requestData.type = request.method;
    requestData.url = request.url;
    requestData.headers = request.headers;
    requestData.remoteAddress = request.connection.remoteAddress;
    requestData.listeners = webhook_room.sockets.clients(request.url).length;
    
    var requestBody = '';
    if(request.method === "POST" || request.method === "PUT") {
        var requestBody = '';
        request.on('data', function(data) {
            requestBody += data;
        });
       
        request.on('end', function() {
            requestData.body = requestBody;
            console.log(new Date() + ' ' + request.connection.remoteAddress + ' ' + request.url + ' is writing ' + requestData.body.length + ' bytes to ' + webhook_room.sockets.clients(request.url).length + ' listeners');
            webhook_room.sockets.to(request.url).emit('requestData', {message: requestData});  
      });
    } else {
        console.log(new Date() + ' ' + request.connection.remoteAddress + ' ' + request.url + ' is writing ' + requestData.body.length + ' bytes to ' + webhook_room.sockets.clients(request.url).length + ' listeners');
        webhook_room.sockets.to(request.url).emit('requestData', {message: requestData});  
    }
    
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end(formOutput);
  
}).listen(serverPort);
console.log('Server running at localhost:'+serverPort);

