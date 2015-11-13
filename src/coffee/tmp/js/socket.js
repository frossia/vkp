var socket;

socket = io.connect('http://playerx.dev:8080');

socket.io.close();

socket.on('user', function(data) {
  console.log(data);
  $('#user').html(socket.id);
});

socket.on('login', function(data) {
  console.log('New user: ' + data.last_name);
});
