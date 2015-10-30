var util = require('util');
var path = require('path');

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);


server.listen(8080, function(){
    console.log("\nSTART!!!");
});


var users = [];

// app.get('/partials/:name', function (req, res) {
// 	var name = req.params.name;
// 	res.render('partials/' + name);
// });

// app.get('/', function (req, res) {
//     res.render('layout');
// });


io.on('connect', function (socket) {
    var clientsCount = io.engine.clientsCount;
    var connectedClients = Object.keys(io.sockets.connected);
    console.log('Connecting :: ' + socket.id);
    // var user = new User(socket.id);
    // users.push(user);
    console.log(io.engine.clientsCount);
    // socket.emit('user', { 'SUCCESS!!!' });
    io.emit('users', { users: connectedClients, usersCount: clientsCount });
    // trtrt
    // io.emit('update users', { users: users } );


    // socket.on('disconnect', function () {
    //     var pos = users.map(function(e) { return e.id; }).indexOf(socket.id);
    //     users.splice(pos, 1);
    //     console.log(users.map(function(e) { return e.id; }));
    //     console.log('Disconnecting :: '+socket.id);
    //     io.sockets.emit('update users', { users: users } );
    // });
});