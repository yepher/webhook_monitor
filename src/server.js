var io = require('socket.io'),
    connect = require('connect'),
    snooper = require('snooper');
var http = require('http');
var qs = require('querystring');

var app = connect().use(connect.static('public')).listen(3000);
var webhook_room = io.listen(app);

snooper.set_sockets(webhook_room.sockets);

webhook_room.sockets.on('connection', function (socket) {
    snooper.connect_snooper({
        socket: socket,
        username: socket.id
    });
});

var formOutput = '<html><body>'
    + '<h1>WebHook Landing Page</h1>'
    + '</body></html>';

var serverPort = 8124;
http.createServer(function (request, response) {
    webhook_room.sockets.emit('webhook', {message: "----------------------------------"});
    webhook_room.sockets.emit('webhook', {message: new Date()});
    webhook_room.sockets.emit('webhook', {message: request.method  + " " + request.url});
    
    for(var item in request.headers) {
        webhook_room.sockets.emit('webhook', {message: item + ": " + request.headers[item]});
    }
    webhook_room.sockets.emit('webhook', {message: "Body"});
    
   if(request.method === "POST" || request.method === "PUT") {
        webhook_room.sockets.emit('webhook', {message: request.body});  
       var requestBody = '';
      request.on('data', function(data) {
        requestBody += data;
      });
      request.on('end', function() {
        //var formData = qs.parse(requestBody);
        webhook_room.sockets.emit('webhook', {message: requestBody});
      });
       
       
    }
    
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end(formOutput);
  
}).listen(serverPort);
console.log('Server running at localhost:'+serverPort);