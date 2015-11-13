

class Login
	constructor: ($scope, $log, User) ->

		$scope.login = ->
			User.login()
			return
		return


class Player
	constructor: ($scope, $log, User, Audio, Socket) ->


		if Audio.songs.length > 0
			$scope.songs = Audio.songs
		else
			Audio.getAudio().then () ->
				$scope.songs = Audio.songs
				# $scope.friends = user.friends
				return
			# console.log 'user.songs'
		User.getUser().then () ->
			Socket.emit 'init', User.user
			$scope.user = User.user

		$scope.addFlash = ->
			Socket.emit 'test:flash', 'test'
			return

		Socket.on 'test:flash', true, (data) ->
			console.log 'Test flash :: ', data
			return

		Socket.on 'user:new', true, (data) ->
			# console.log 'User connected :: ', data
			return


		$scope.logout = ->
			User.logout()
			return

		return


class Friends
	constructor: ($scope, Friends) ->

		# log = $log.getInstance(arguments.callee.name);
		# log.info 'called...'

		Friends.getFriends().then ->
			$scope.friends = Friends.friends
			$scope.filters = ['count', 'albums', 'videos', 'audios', 'photos', 'notes', 'friends', 'groups', 'online_friends', 'mutual_friends', 'user_videos', 'followers']
			# for attr, value of user.friends[0].counters
			# 	$scope.filters.push attr
			# 	console.log attr, value

			return

		$scope.userInfo = (user) ->
			console.log Object.keys(user.counters).length
			console.log user

		return





angular.module('vkp')
.controller('loginController', ['$scope', '$log', 'User', Login])
.controller('playerController', ['$scope', '$log', 'User', 'Audio', 'Socket', Player])
.controller('friendsController', ['$scope', 'Friends', Friends])