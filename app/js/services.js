checkNested = function(obj) {
  var args, i;
  args = Array.prototype.slice.call(arguments, 1);
  i = 0;
  while (i < args.length) {
    if (!obj || !obj.hasOwnProperty(args[i])) {
      return false;
    }
    obj = obj[args[i]];
    i++;
  }
  return true;
};


vkp.factory('User', [ '$rootScope', '$q', '$state', '$timeout', '$http', function( $rootScope, $q, $state, $timeout, $http ) {


	var vk = {
		apiId: 4761529,
		appPermissions: 8,

		user: {},

		friends: [],

		songs: [],

		init: function () {
			VK.init({ apiId: vk.apiId });
		},


		checkLogin: function () {
			var d = $q.defer();

			VK.Auth.getLoginStatus(function(res) {
				if (res.session) {
					socket.io.open();
					d.resolve(res)
					// vk.getUser()
				} else {
					d.reject()
					// socket.disconnect();
					// VK.Auth.login(authInfo, vk.appPermissions);
				}
			});

			return d.promise;
		},

		login: function () {

			function authInfo(response){
				if(response.session){ 
					// console.warn('Вы вошли! ', response);
					// vk.user = response;
					vk.getAudio();
					$rootScope.$apply(function(){
						$rootScope.user = response.session.user.last_name
					});
					$timeout( function() {
						$state.go("player");
					}, 2000)
				}else {
					$state.go("login");
					console.error("Авторизоваться не удалось!");
				}
			}

			VK.Auth.login(authInfo, vk.appPermissions);
		},		

		logout: function () {
			VK.Auth.logout( function () {
				$state.go("login")
				console.log('Вы вышли!');
				socket.io.close();
			});
		},

		getUser: function(){

			var d = $q.defer();

			VK.Auth.getLoginStatus(function(response) {
				if (response.session) {
					vk.user.session = response.session;
					var fields = ['photo_100', 'photo_50', 'last_seen'];
					VK.Api.call('users.get', { fields: fields }, function (res) {
						vk.user.info = res.response[0];
						// var socket = io.connect('http://playerx.dev:8080');
						// socketOptions(socket);
						// socket.io.open()
						vk.getFriends();
						vk.user = res.response[0];
						socket.emit('login', res.response[0]);
						d.resolve( res.response[0] );
					})
				} else {
					VK.Auth.login(authInfo, vk.appPermissions);
					// VK.Auth.login();
					console.log('not loginned')
				}

			});

			return d.promise;			

		},



		getFriends: function () {

			var d = $q.defer();

			var fields = ['nickname', 'photo_50', 'can_see_audio', 'status', 'last_seen', 'counters'];

			VK.Api.call('friends.get', { count: 15, order: 'hints', fields: fields }, function (res) {
				// console.log(res);
				t = res.response;

				angular.forEach(t, function (friend, i) {
					if (friend.can_see_audio != 0) {

						$timeout( function () {
							VK.Api.call('users.get', { user_ids: friend.uid, fields: 'counters' }, function (res) {
								friend.counters = res.response[0].counters;
								vk.friends.push(friend);
								// console.warn(friend);
							});							

						}, i * 400);
					}
				});

				// vk.friends = res.response;
				// vk.user.info = res.response[0];
				// vk.user = res.response[0];
				// socket.emit('login', res.response[0]);
				// d.resolve( res.response[0] );
			})

			return d.promise;			

		},

//////////////////////////////////////////////////////

		getAudio: function(){

			var d = $q.defer();

			VK.Api.call('audio.get', { count: 40 }, function (res) {
				vk.songs = res.response;
				vk.parseSongsInfo(vk.songs);
				d.resolve( res.response );
			});

			return d.promise;

		},

    parseSongsInfo: function(songs) {
      var promises;

      promises = songs.map(function(song) {

        var artist, defer, title;
        artist = song.artist.replace("#", "");
        title = song.title.replace("#", "");
        song.playProgress = 0;
        song.playing = false;
        song.inPlaylist = false;
        song.test = 'null';
        defer = $q.defer();

        $http.get("http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=09b98472116a6ab574aea3c4fe783b27&artist=" + artist + "&track=" + title + "&format=json").then((function(data) {
          var images;
          if (checkNested(data.data, 'track', 'album', 'image') && data.data.track.album.image[data.data.track.album.image.length - 1]["#text"] !== '') {
        		song.test = 'album';
            images = data.data.track.album.image;
            song.images = images;
            song.image = images[images.length - 1]["#text"];
            defer.resolve(song);
          } else {
            return $http.get("http://ws.audioscrobbler.com/2.0/?method=artist.getInfo&api_key=09b98472116a6ab574aea3c4fe783b27&artist=" + artist + "&format=json").then((function(data) {
              if (checkNested(data.data, 'artist', 'image') && data.data.artist.image[data.data.artist.image.length - 1]["#text"] !== '') {
        				song.test = 'artist';
                images = data.data.artist.image;
                song.images = images;
                song.image = images[images.length - 3]["#text"];
              } else {
                song.images = [];
        				song.test = 'no image';
        				song.noImage = true;
                song.image = 'img/vinyl.png';
              }
              defer.resolve(song);
            }));
          }
        }));

        return defer.promise.then((function(song) {
          // vk.songsLoaded++;
        	// console.log(song);

          // return vk.songs.push(song);
        }));
      });
      return $q.all(promises);
    }


	}


	vk.init();
	return vk;

}]);

