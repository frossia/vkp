var Main;

Main = (function() {
  function Main($rootScope, $q, $state, $timeout, Audio, $log) {
    var main;
    main = {
      apiId: 4761529,
      appPermissions: 8,
      songToLoad: 20,
      user: {},
      friends: [],
      songs: [],
      init: function() {
        $log.info('Loaded service :: Main.init');
        VK.init({
          apiId: main.apiId
        });
        $rootScope.loadingPercent = 0;
      },
      checkLogin: function() {
        var d;
        $log.info('Loaded service :: Main.checkLogin');
        d = $q.defer();
        VK.Auth.getLoginStatus(function(res) {
          if (res.session) {
            socket.io.open();
            d.resolve(res);
          } else {
            d.reject();
          }
        });
        return d.promise;
      },
      login: function() {
        var authInfo;
        $log.info('Loaded service :: Main.login');
        authInfo = function(response) {
          if (response.session) {
            main.getUser().then(function() {
              $rootScope.user = main.user;
              Audio.getAudio().then(function() {
                return $state.go('player');
              });
            });
          } else {
            $state.go('login');
            $log.error('Авторизоваться не удалось!');
          }
        };
        VK.Auth.login(authInfo, main.appPermissions);
      },
      logout: function() {
        main.user = {};
        main.fields = [];
        main.songs = [];
        $rootScope.user = null;
        VK.Auth.logout(function() {
          $state.go('login');
          $log.log('Вы вышли!');
          socket.io.close();
        });
      },
      getUser: function() {
        var d;
        $log.info('Loaded service :: Main.getUser');
        d = $q.defer();
        VK.Auth.getLoginStatus(function(response) {
          var fields;
          if (response.session) {
            fields = ['photo_100', 'photo_50', 'last_seen'];
            VK.Api.call('users.get', {
              fields: fields
            }, function(res) {
              main.user.info = res.response[0];
              main.user = res.response[0];
              socket.emit('login', res.response[0]);
              d.resolve();
            });
          } else {
            $log.error('not auth!');
          }
        });
        return d.promise;
      },
      doTest: function() {
        var d, promises, vkExecuteFriendsGet;
        vkExecuteFriendsGet = function(offset) {
          var code, execPromise;
          execPromise = $q.defer();
          code = 'var users = []; var data = []; var count = 0; users = API.friends.get({"count": "20", "offset": ' + offset + ', "order": "hints", "fields": ["photo_50"] }); while(count < users.length) { var info = API.users.get( { "user_ids": users[count].uid, "fields": "photo_50, photo_100, can_see_audio, counters" } ); data.push(info); count = count + 1; } return data;';
          VK.api('execute', {
            code: code
          }, function(data) {
            data.response.map(function(friend, i) {
              friend[0].id = offset + i;
              if (!('deactivated' in friend[0])) {
                friend[0].counters.count = Object.keys(friend[0].counters).length;
                main.friends.push(friend[0]);
              }
            });
            execPromise.resolve(data);
          });
          return execPromise.promise;
        };
        d = $q.defer();
        promises = [];
        VK.api('execute', {
          code: 'return API.friends.get();'
        }, function(data) {
          var friendsCount, j, offset, prm, ref, zzzdata;
          friendsCount = data.response.length;
          $log.log("friendsCount: " + friendsCount);
          zzzdata = [];
          for (offset = j = 0, ref = friendsCount; j <= ref; offset = j += 20) {
            prm = vkExecuteFriendsGet(offset);
            promises.push(prm);
          }
          return $q.all(promises).then(function() {
            d.resolve();
          });
        });
        return d.promise;
      }
    };
    main.init();
    return main;
  }

  return Main;

})();

angular.module('vkp').factory('Main', ['$rootScope', '$q', '$state', '$timeout', 'Audio', '$log', Main]);
