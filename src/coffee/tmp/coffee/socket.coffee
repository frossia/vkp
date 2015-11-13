socket = io.connect('http://playerx.dev:8080')
socket.io.close()
# function socketOptions(socket) {
#   if (socket !== undefined) {
socket.on 'user', (data) ->
	console.log data
	$('#user').html socket.id
	return
socket.on 'login', (data) ->
	console.log 'New user: ' + data.last_name
	return
# }
# };
