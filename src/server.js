var io = require('socket.io'),
    connect = require('connect'),
    snooper = require('snooper');
var http = require('http');
var qs = require('querystring');

var app = connect().use(connect.static('public')).listen(3000);
var chat_room = io.listen(app);

snooper.set_sockets(chat_room.sockets);

chat_room.sockets.on('connection', function (socket) {
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
    chat_room.sockets.emit('chat', {message: "----------------------------------"});
    chat_room.sockets.emit('chat', {message: new Date()});
    chat_room.sockets.emit('chat', {message: request.method  + " " + request.url});
    
    for(var item in request.headers) {
        chat_room.sockets.emit('chat', {message: item + ": " + request.headers[item]});
    }
    chat_room.sockets.emit('chat', {message: "Body"});
    
   if(request.method === "POST" || request.method === "PUT") {
        chat_room.sockets.emit('chat', {message: request.body});  
       var requestBody = '';
      request.on('data', function(data) {
        requestBody += data;
      });
      request.on('end', function() {
        //var formData = qs.parse(requestBody);
        chat_room.sockets.emit('chat', {message: requestBody});
      });
       
       
    }
    
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end(formOutput);
  
}).listen(serverPort);
console.log('Server running at localhost:'+serverPort);