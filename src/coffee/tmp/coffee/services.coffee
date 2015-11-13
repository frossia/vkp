
class Main
	constructor: ($rootScope, $q, $state, $timeout, Audio, $log) ->

		main = {

			apiId: 4761529
			appPermissions: 8
			songToLoad: 20
			user: {}
			friends: []
			songs: []

			init: ->
				$log.info 'Loaded service :: Main.init'
				VK.init apiId: main.apiId
				# logger.log main.apiId
				$rootScope.loadingPercent = 0
				return


			checkLogin: ->
				$log.info 'Loaded service :: Main.checkLogin'
				d = $q.defer()
				VK.Auth.getLoginStatus (res) ->
					if res.session
						socket.io.open()
						d.resolve res
						# main.getUser()
					else
						d.reject()
						# socket.disconnect();
						# VK.Auth.login(authInfo, main.appPermissions);
					return
				d.promise


			login: ->
				$log.info 'Loaded service :: Main.login'

				authInfo = (response) ->
					if response.session
						# $log.warn('Вы вошли! ', response);
						# main.user = response;
						# main.getAudio()
						main.getUser().then () ->
							$rootScope.user = main.user
							Audio.getAudio().then () ->
								$state.go 'player'

							return
						# $timeout (->
						# 	$state.go 'player'
						# 	return
						# ), 2000
					else
						$state.go 'login'
						$log.error 'Авторизоваться не удалось!'
					return

				VK.Auth.login authInfo, main.appPermissions
				return


			logout: ->
				main.user = {}
				main.fields = []
				main.songs = []
				$rootScope.user = null
				VK.Auth.logout ->
					$state.go 'login'
					$log.log 'Вы вышли!'
					socket.io.close()
					return
				return



			getUser: ->
				$log.info 'Loaded service :: Main.getUser'
				d = $q.defer()
				VK.Auth.getLoginStatus (response) ->
					if response.session
						fields = ['photo_100', 'photo_50', 'last_seen']
						VK.Api.call 'users.get', { fields: fields }, (res) ->
							main.user.info = res.response[0]
							# socketOptions(socket);
							# socket.io.open()
							# main.getFriends()
							main.user = res.response[0]
							socket.emit 'login', res.response[0]
							# d.resolve res.response[0]
							d.resolve()
							return
					else
						# VK.Auth.login authInfo, main.appPermissions
						# VK.Auth.login();
						$log.error 'not auth!'
					return
				d.promise




			doTest: ->

				vkExecuteFriendsGet = (offset) ->

					execPromise = $q.defer()
					code = '
						var users = [];
						var data = [];
						var count = 0;

						users = API.friends.get({"count": "20", "offset": '+offset+', "order": "hints", "fields": ["photo_50"] });

						while(count < users.length) {
							var info = API.users.get( { "user_ids": users[count].uid, "fields": "photo_50, photo_100, can_see_audio, counters" } );
							data.push(info);
							count = count + 1;
						}

						return data;
					'
					VK.api 'execute', { code: code }, (data) ->
						data.response.map (friend, i) ->
							friend[0].id = offset + i
							unless 'deactivated' of friend[0]
								friend[0].counters.count = Object.keys(friend[0].counters).length
								main.friends.push friend[0]
							# $log.log friend[0]
							return
						execPromise.resolve(data)
						return

					# promises.push execPromise.promise
					# return
					execPromise.promise


				d = $q.defer()
				promises = []

				VK.api 'execute', { code: 'return API.friends.get();' }, (data) ->

					friendsCount = data.response.length
					$log.log "friendsCount: #{friendsCount}"

					zzzdata = []

					for offset in [0..friendsCount] by 20
						prm = vkExecuteFriendsGet(offset)
						promises.push prm


					$q.all(promises).then () ->
						d.resolve()
						return

				return d.promise

		}

		# logger = $log.getInstance('Awesome')
		# logger.info 'info test'
		# $log.debug 'Init()'
		main.init()

		return main




angular.module('vkp')
.factory('Main', ['$rootScope', '$q', '$state', '$timeout', 'Audio', '$log', Main])