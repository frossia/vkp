
class User extends Factory
	constructor: ($rootScope, $q, $state, $timeout, $log, CFG, Audio, Socket) ->

		o = {

			apiId: 4761529
			appPermissions: 8
			songToLoad: 20
			user: {}
			friends: []
			songs: []

			init: ->
				$log.info 'Loaded service :: User.init'
				VK.init apiId: o.apiId
				# logger.log o.apiId
				$rootScope.loadingPercent = 0
				return


			checkLogin: ->
				$log.info 'Loaded service :: User.checkLogin'
				d = $q.defer()
				VK.Auth.getLoginStatus (res) ->
					if res.session
						# socket.io.open()
						d.resolve res
						# o.getUser()
					else
						d.reject()
						# socket.disconnect();
						# VK.Auth.login(authInfo, o.appPermissions);
					return
				d.promise


			login: ->
				$log.info 'Loaded service :: User.login'

				authInfo = (response) ->
					if response.session
						# $log.warn('Вы вошли! ', response);
						# o.user = response;
						# o.getAudio()
						o.getUser().then () ->
							$rootScope.user = o.user

							Audio.getAudioCount().then (d) ->
								$rootScope.songsToLoad = d
							# //////////////////////////////////////////////
							songsToLoad = $rootScope.songsToLoad || CFG.songsToLoad
							Audio.getAudio(songsToLoad).then () ->
								$rootScope.songsToLoad = songsToLoad
								$state.go 'player' if CFG.redirect
							# //////////////////////////////////////////////

							return

					else
						$state.go 'login'
						$log.error 'Авторизоваться не удалось!'
					return

				VK.Auth.login authInfo, o.appPermissions
				return


			logout: ->
				o.user = {}
				o.fields = []
				o.songs = []
				$rootScope.user = null
				VK.Auth.logout ->
					$state.go 'login'
					$log.log 'Вы вышли!'
					# socket.io.close()
					return
				return



			getUser: ->
				$log.info 'Loaded service :: User.getUser'
				d = $q.defer()
				VK.Auth.getLoginStatus (response) ->
					if response.session
						fields = ['photo_100', 'photo_50', 'last_seen']
						VK.Api.call 'users.get', { fields: fields }, (res) ->
							o.user.info = res.response[0]
							# socketOptions(socket);
							# socket.io.open()
							o.user = res.response[0]
							# Socket.emit 'login', res.response[0]
							# d.resolve res.response[0]
							d.resolve()
							return
					else
						# VK.Auth.login authInfo, o.appPermissions
						# VK.Auth.login();
						$log.error 'not auth!'
					return
				d.promise






		}

		# logger = $log.getInstance('Awesome')
		# logger.info 'info test'
		# $log.debug 'Init()'
		o.init()

		return o


