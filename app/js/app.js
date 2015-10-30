var socket = io.connect('http://localhost:8080');
socket.on('user', function (data) {
  console.log(data);

  $('#user').html(socket.id);
  // $('#users').html(JSON.stringify(socket.io.connected))
  // socket
  // socket.emit('my other event', { my: 'data' });
});
socket.on('users', function (data) {
  console.log(socket.id);

  $('#user').html(socket.id);
  $('#users').html(JSON.stringify(data));
  // $('#users').html(JSON.stringify(socket.io.connected))
  // socket
  // socket.emit('my other event', { my: 'data' });
});