checkNested = (obj) ->
	args = undefined
	i = undefined
	args = Array::slice.call(arguments, 1)
	i = 0
	while i < args.length
		if !obj or !obj.hasOwnProperty(args[i])
			return false
		obj = obj[args[i]]
		i++
	true

class Audio
	constructor: ($rootScope, $q, $state, $timeout, $log, $http) ->

		audio = {

			songs: []

			getAudioCount: ->
				d = $q.defer()
				VK.Api.call 'audio.get', { }, (res) ->
					if res.error
						$log.error res
						return
					d.resolve res.response.length

				d.promise

			getAudio: (songToLoad = 8) ->
				d = $q.defer()
				VK.Api.call 'audio.get', { count: songToLoad }, (res) ->
					if res.error
						$log.error res
						return
					audio.songs = res.response
					audio.parseSongsInfo(audio.songs).then () ->
						d.resolve res.response
						$rootScope.loadingPercent = 0
						console.warn 'GetAudio resolved!'
					return
				d.promise


			parseSongsInfo: (songs) ->
				$log.info songs
				songsCount = songs.length
				percent = 100 / songsCount
				$rootScope.loadingPercent = 0

				promises = undefined
				promises = songs.map((song) ->
					artist = undefined
					defer = undefined
					title = undefined
					artist = song.artist.replace('#', '')
					title = song.title.replace('#', '')
					song.playProgress = 0
					song.playing = false
					song.inPlaylist = false
					song.test = 'null'
					defer = $q.defer()
					$http.get('http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=09b98472116a6ab574aea3c4fe783b27&artist=' + artist + '&track=' + title + '&format=json').then (data) ->
						images = undefined
						if checkNested(data.data, 'track', 'album', 'image') and data.data.track.album.image[data.data.track.album.image.length - 1]['#text'] != ''
							song.test = 'album'
							images = data.data.track.album.image
							song.images = images
							song.image = images[images.length - 1]['#text']
							defer.resolve song
						else
							return $http.get('http://ws.audioscrobbler.com/2.0/?method=artist.getInfo&api_key=09b98472116a6ab574aea3c4fe783b27&artist=' + artist + '&format=json').then((data) ->
								if checkNested(data.data, 'artist', 'image') and data.data.artist.image[data.data.artist.image.length - 1]['#text'] != ''
									song.test = 'artist'
									images = data.data.artist.image
									song.images = images
									song.image = images[images.length - 3]['#text']
								else
									song.images = []
									song.test = 'no image'
									song.noImage = true
									song.image = 'img/vinyl.png'
								defer.resolve song
								return
							)
						return
					defer.promise.then (song) ->
						# audio.songsLoaded++;
						$rootScope.loadingPercent = $rootScope.loadingPercent + percent
						# console.log $rootScope.loadingPercent
						# console.log songs.length
						# return audio.songs.push(song);
						return
				)
				$q.all promises

		}

		return audio


angular.module('vkp')
.factory('Audio', ['$rootScope', '$q', '$state', '$timeout', '$log', '$http', Audio])