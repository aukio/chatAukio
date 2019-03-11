var express = require('express');
var socket = require('socket.io');

// App setup
var app = express();
var server = app.listen(4000, function(){
	console.log('AUKIO: listening to requests on port 4000');
});

// Static files
app.use(express.static('public'));


// Socket setup
var io = socket(server);

// Socketin liittyessä ilmoita konsolissa
io.on('connection', function(socket){
	console.log('AUKIO: made socket connection', socket.id)

// Ilmoita konsolissa uusi viesti
	socket.on('chat', function(data){
		io.sockets.emit('chat', data);
		console.log('AUKIO: message sent');
	});
});