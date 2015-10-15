var io = require('socket.io'),
    connect = require('connect'),
    snooper = require('snooper');
var http = require('http');
var qs = require('querystring');

var websocktPort = 3000;
var serverPort = 8080;


var app = connect().use(connect.static('public')).listen(websocktPort);
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
    + 'View your data <a href=":8080">here</a>'
    + '</body></html>';


http.createServer(function (request, response) {
    var requestData = {  };
    requestData.body = '';
    
    // Build up the object that will be sent to clients via websocket
    requestData.date = new Date();
    requestData.type = request.method;
    requestData.url = request.url
    requestData.headers = request.headers;
    requestData.remoteAddress = request.connection.remoteAddress;
    
    var requestBody = '';
    if(request.method === "POST" || request.method === "PUT") {
        var requestBody = '';
        request.on('data', function(data) {
            requestBody += data;
        });
       
        request.on('end', function() {
            requestData.body = requestBody;
            webhook_room.sockets.emit('requestData', {message: requestData});  
      });
    } else {
        webhook_room.sockets.emit('requestData', {message: requestData});  
    }
    
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end(formOutput);
  
}).listen(serverPort);
console.log('Server running at localhost:'+serverPort);