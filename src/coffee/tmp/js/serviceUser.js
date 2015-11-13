var User;

User = (function() {
  function User($rootScope, $q, $state, $timeout, $log, CFG, Audio, Socket) {
    var o;
    o = {
      apiId: 4761529,
      appPermissions: 8,
      songToLoad: 20,
      user: {},
      friends: [],
      songs: [],
      init: function() {
        $log.info('Loaded service :: User.init');
        VK.init({
          apiId: o.apiId
        });
        $rootScope.loadingPercent = 0;
      },
      checkLogin: function() {
        var d;
        $log.info('Loaded service :: User.checkLogin');
        d = $q.defer();
        VK.Auth.getLoginStatus(function(res) {
          if (res.session) {
            d.resolve(res);
          } else {
            d.reject();
          }
        });
        return d.promise;
      },
      login: function() {
        var authInfo;
        $log.info('Loaded service :: User.login');
        authInfo = function(response) {
          if (response.session) {
            o.getUser().then(function() {
              var songsToLoad;
              $rootScope.user = o.user;
              Audio.getAudioCount().then(function(d) {
                return $rootScope.songsToLoad = d;
              });
              songsToLoad = $rootScope.songsToLoad || CFG.songsToLoad;
              Audio.getAudio(songsToLoad).then(function() {
                $rootScope.songsToLoad = songsToLoad;
                if (CFG.redirect) {
                  return $state.go('player');
                }
              });
            });
          } else {
            $state.go('login');
            $log.error('Авторизоваться не удалось!');
          }
        };
        VK.Auth.login(authInfo, o.appPermissions);
      },
      logout: function() {
        o.user = {};
        o.fields = [];
        o.songs = [];
        $rootScope.user = null;
        VK.Auth.logout(function() {
          $state.go('login');
          $log.log('Вы вышли!');
        });
      },
      getUser: function() {
        var d;
        $log.info('Loaded service :: User.getUser');
        d = $q.defer();
        VK.Auth.getLoginStatus(function(response) {
          var fields;
          if (response.session) {
            fields = ['photo_100', 'photo_50', 'last_seen'];
            VK.Api.call('users.get', {
              fields: fields
            }, function(res) {
              o.user.info = res.response[0];
              o.user = res.response[0];
              d.resolve();
            });
          } else {
            $log.error('not auth!');
          }
        });
        return d.promise;
      }
    };
    o.init();
    return o;
  }

  return User;

})();

angular.module('vkp').factory('User', ['$rootScope', '$q', '$state', '$timeout', '$log', 'CFG', 'Audio', 'Socket', User]);
