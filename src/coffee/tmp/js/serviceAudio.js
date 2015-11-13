var Audio, checkNested;

checkNested = function(obj) {
  var args, i;
  args = void 0;
  i = void 0;
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

Audio = (function() {
  function Audio($rootScope, $q, $state, $timeout, $log, $http) {
    var audio;
    audio = {
      songs: [],
      getAudioCount: function() {
        var d;
        d = $q.defer();
        VK.Api.call('audio.get', {}, function(res) {
          if (res.error) {
            $log.error(res);
            return;
          }
          return d.resolve(res.response.length);
        });
        return d.promise;
      },
      getAudio: function(songToLoad) {
        var d;
        if (songToLoad == null) {
          songToLoad = 8;
        }
        d = $q.defer();
        VK.Api.call('audio.get', {
          count: songToLoad
        }, function(res) {
          if (res.error) {
            $log.error(res);
            return;
          }
          audio.songs = res.response;
          audio.parseSongsInfo(audio.songs).then(function() {
            d.resolve(res.response);
            $rootScope.loadingPercent = 0;
            return console.warn('GetAudio resolved!');
          });
        });
        return d.promise;
      },
      parseSongsInfo: function(songs) {
        var percent, promises, songsCount;
        $log.info(songs);
        songsCount = songs.length;
        percent = 100 / songsCount;
        $rootScope.loadingPercent = 0;
        promises = void 0;
        promises = songs.map(function(song) {
          var artist, defer, title;
          artist = void 0;
          defer = void 0;
          title = void 0;
          artist = song.artist.replace('#', '');
          title = song.title.replace('#', '');
          song.playProgress = 0;
          song.playing = false;
          song.inPlaylist = false;
          song.test = 'null';
          defer = $q.defer();
          $http.get('http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=09b98472116a6ab574aea3c4fe783b27&artist=' + artist + '&track=' + title + '&format=json').then(function(data) {
            var images;
            images = void 0;
            if (checkNested(data.data, 'track', 'album', 'image') && data.data.track.album.image[data.data.track.album.image.length - 1]['#text'] !== '') {
              song.test = 'album';
              images = data.data.track.album.image;
              song.images = images;
              song.image = images[images.length - 1]['#text'];
              defer.resolve(song);
            } else {
              return $http.get('http://ws.audioscrobbler.com/2.0/?method=artist.getInfo&api_key=09b98472116a6ab574aea3c4fe783b27&artist=' + artist + '&format=json').then(function(data) {
                if (checkNested(data.data, 'artist', 'image') && data.data.artist.image[data.data.artist.image.length - 1]['#text'] !== '') {
                  song.test = 'artist';
                  images = data.data.artist.image;
                  song.images = images;
                  song.image = images[images.length - 3]['#text'];
                } else {
                  song.images = [];
                  song.test = 'no image';
                  song.noImage = true;
                  song.image = 'img/vinyl.png';
                }
                defer.resolve(song);
              });
            }
          });
          return defer.promise.then(function(song) {
            $rootScope.loadingPercent = $rootScope.loadingPercent + percent;
          });
        });
        return $q.all(promises);
      }
    };
    return audio;
  }

  return Audio;

})();

angular.module('vkp').factory('Audio', ['$rootScope', '$q', '$state', '$timeout', '$log', '$http', Audio]);
