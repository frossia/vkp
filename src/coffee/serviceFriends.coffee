class Friends extends Factory
	constructor: ($rootScope, $q, $state, $timeout, Audio, $log) ->

		o = {

			friends: []

			getFriends: ->

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
								o.friends.push friend[0]
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

		return o
