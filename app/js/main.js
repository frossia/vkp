var Cfg, Routes, checkRoutes;

angular.module('vkp', ['ui.router']);

Cfg = (function() {
  function Cfg() {
    return {
      production: false,
      socketUrl: 'http://playerx.dev:8080',
      checkRoutes: true,
      redirect: true,
      debugEnabled: true,
      infoEnabled: true,
      songsToLoad: 10
    };
  }

  return Cfg;

})();

Routes = (function() {
  function Routes($stateProvider, $urlRouterProvider, $locationProvider, $logProvider, $provide, CFG) {
    $stateProvider.state('login', {
      url: '/',
      templateUrl: 'partials/login.html',
      controller: 'loginController'
    }).state('player', {
      url: '/player',
      templateUrl: 'partials/player.html',
      controller: 'playerController'
    }).state('friends', {
      url: '/friends',
      templateUrl: 'partials/friends.html',
      controller: 'friendsController'
    });
    $urlRouterProvider.otherwise('/');
    $provide.decorator('$log', [
      '$delegate', function($delegate) {
        var origDebug, origInfo;
        origInfo = $delegate.info;
        origDebug = $delegate.debug;
        $delegate.info = function() {
          if (CFG.infoEnabled) {
            return origInfo.apply(null, arguments);
          }
        };
        $delegate.debug = function() {
          if (CFG.debugEnabled) {
            return origDebug.apply(null, arguments);
          }
        };
        return $delegate;
      }
    ]);
    return;
  }

  return Routes;

})();

checkRoutes = (function() {
  function checkRoutes($state, $log, $rootScope, $timeout, User, CFG) {
    if (CFG.checkRoutes && !CFG.production) {
      $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
        if (toState.name === 'login') {
          User.checkLogin().then(function(res) {
            $state.go('player');
          });
        } else if (toState.name === 'player') {
          User.checkLogin().then(null, function(err) {
            $state.go('login');
          });
        }
      });
    }
  }

  return checkRoutes;

})();

angular.module('vkp').constant('CFG', Cfg()).config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$logProvider', '$provide', 'CFG', Routes]).run(['$state', '$log', '$rootScope', '$timeout', 'User', 'CFG', checkRoutes]);

var Friends, Login, Player;

Login = (function() {
  function Login($scope, $log, User) {
    $scope.login = function() {
      User.login();
    };
    return;
  }

  return Login;

})();

Player = (function() {
  function Player($scope, $log, User, Audio, Socket) {
    if (Audio.songs.length > 0) {
      $scope.songs = Audio.songs;
    } else {
      Audio.getAudio().then(function() {
        $scope.songs = Audio.songs;
      });
    }
    User.getUser().then(function() {
      Socket.emit('init', User.user);
      return $scope.user = User.user;
    });
    $scope.addFlash = function() {
      Socket.emit('test:flash', 'test');
    };
    Socket.on('test:flash', true, function(data) {
      console.log('Test flash :: ', data);
    });
    Socket.on('user:new', true, function(data) {});
    $scope.logout = function() {
      User.logout();
    };
    return;
  }

  return Player;

})();

Friends = (function() {
  function Friends($scope, Friends) {
    Friends.getFriends().then(function() {
      $scope.friends = Friends.friends;
      $scope.filters = ['count', 'albums', 'videos', 'audios', 'photos', 'notes', 'friends', 'groups', 'online_friends', 'mutual_friends', 'user_videos', 'followers'];
    });
    $scope.userInfo = function(user) {
      console.log(Object.keys(user.counters).length);
      return console.log(user);
    };
    return;
  }

  return Friends;

})();

angular.module('vkp').controller('loginController', ['$scope', '$log', 'User', Login]).controller('playerController', ['$scope', '$log', 'User', 'Audio', 'Socket', Player]).controller('friendsController', ['$scope', 'Friends', Friends]);

var Flash, Imageonload, Load, LoginForm, NoImage;

Flash = (function() {
  function Flash($rootScope, $compile, $templateRequest, $timeout, Socket) {
    return {
      restrict: 'E',
      replace: true,
      template: '<div class="fixed"></div>',
      link: function(scope, element, attrs) {
        var id;
        scope.message = Socket.message;
        scope.messages = Socket.messages;
        id = 0;
        scope.$watchCollection('messages', function(n, o) {
          if (n.length !== o.length) {
            if (n.length < o.length) {
              id--;
              console.log('REMOVED', id);
            } else {
              id++;
              console.log(id);
              console.log('ADDED');
              $timeout((function() {
                scope.messages.splice(0, 1);
              }), id * 3000);
            }
            return;
          }
        });
        scope.$watch('message', (function(n, o) {
          var animate;
          if (n !== o) {
            switch (n.eventName) {
              case 'user:new':
                console.log('newValue', n);
                $templateRequest('partials/flashes/info.html').then(function(html) {
                  var tmpl;
                  tmpl = angular.element(html);
                  element.append(tmpl);
                  $compile(tmpl)(scope);
                  console.log('asdasd', element);
                  animate(element.children());
                  messages.push(n);
                });
            }
            animate = function(el) {
              return TweenMax.fromTo(el, 1.5, {
                y: -100
              }, {
                y: 0,
                ease: Elastic.easeOut
              });
            };
          }
        }), true);
      }
    };
  }

  return Flash;

})();

LoginForm = (function() {
  function LoginForm($rootScope, $timeout, $log) {
    return {
      restrict: 'EA',
      templateUrl: 'partials/loginForm.html',
      link: function(scope, element, attrs) {
        var afterLogin, data, loginBtn, preLogin;
        preLogin = angular.element(document.querySelector('#pre_login'));
        loginBtn = angular.element(document.querySelector('#login_btn'));
        afterLogin = angular.element(document.querySelector('#user_avatar'));
        data = angular.element(document.querySelector('#data'));
        loginBtn.bind('mouseenter', function() {
          TweenMax.to(preLogin, .5, {
            scale: 1.1,
            ease: Elastic.easeOut
          });
          TweenMax.to(preLogin, 1.5, {
            delay: 0.1,
            scale: 1,
            ease: Elastic.easeOut
          });
        });
        scope.$watch('user', function(newValue, oldValue) {
          if (scope.user) {
            TweenMax.to(preLogin, 0.6, {
              scale: 0,
              opacity: 0,
              display: 'none',
              ease: Back.easeIn
            });
            TweenMax.fromTo(afterLogin, 1, {
              scale: 0,
              opacity: 0,
              ease: Back.easeIn
            }, {
              scale: 1,
              opacity: 1,
              ease: Elastic.easeOut,
              delay: 1
            });
            TweenMax.fromTo(data, 1, {
              scale: 0,
              opacity: 0,
              ease: Back.easeIn
            }, {
              scale: 1,
              opacity: 1,
              ease: Elastic.easeOut,
              delay: 2
            });
          }
        });
      }
    };
  }

  return LoginForm;

})();

Load = (function() {
  function Load($rootScope) {
    return {
      restrict: 'A',
      templateUrl: 'partials/loading.html',
      link: function(scope, element, attr) {
        var c, c2, circleLength, r, s;
        s = Snap('#loading');
        r = 35;
        c2 = s.circle(40, 40, r).attr({
          fill: 'transparent',
          stroke: 'red',
          strokeWidth: 1,
          strokeDasharray: circleLength,
          strokeDashoffset: circleLength
        });
        c = s.circle(40, 40, r);
        circleLength = 2 * Math.PI * r;
        c.attr({
          fill: 'transparent',
          stroke: '#fff',
          strokeWidth: 10,
          transform: 'rotate(-90 40 40)',
          strokeDasharray: circleLength,
          strokeDashoffset: circleLength
        });
        return scope.$watch('loadingPercent', function(newValue, oldValue) {
          var val;
          val = circleLength - (circleLength * newValue / 100);
          c.animate({
            strokeDashoffset: val
          }, 10, mina.easeinout);
        });
      }
    };
  }

  return Load;

})();

Imageonload = (function() {
  function Imageonload() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        element.bind('load', function() {
          element.addClass('loaded');
        });
      }
    };
  }

  return Imageonload;

})();

NoImage = (function() {
  function NoImage() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        attrs.$observe('noImage', function(value) {
          var canvas, draw, getRandomColor, i, id, j;
          getRandomColor = function() {
            var color, k, letters;
            letters = '0123456789ABCDEF'.split('');
            color = '#';
            k = 0;
            while (k < 6) {
              color += letters[Math.floor(Math.random() * 16)];
              k++;
            }
            return color;
          };
          if (value === 'true') {
            id = attrs.hash.replace(':', '');
            element.addClass('no-image');
            canvas = angular.element('<svg id=' + id + ' class="svg-no-image"></svg>');
            canvas.addClass('anim');
            element.prepend(canvas);
            draw = Snap('#' + id);
            i = 0;
            while (i < 10) {
              j = 0;
              while (j < 10) {
                draw.rect(i * 30, j * 30, 30, 30).attr({
                  fill: getRandomColor()
                });
                j++;
              }
              i++;
            }
          }
        });
      }
    };
  }

  return NoImage;

})();

angular.module('vkp').directive('flash', ['$rootScope', '$compile', '$templateRequest', '$timeout', 'Socket', Flash]).directive('loginForm', ['$rootScope', '$timeout', '$log', LoginForm]).directive('load', ['$rootScope', Load]).directive('imageonload', [Imageonload]).directive('noImage', [NoImage]);

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

var Friends;

Friends = (function() {
  function Friends($rootScope, $q, $state, $timeout, Audio, $log) {
    var o;
    o = {
      friends: [],
      getFriends: function() {
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
                o.friends.push(friend[0]);
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
    return o;
  }

  return Friends;

})();

angular.module('vkp').factory('Friends', ['$rootScope', '$q', '$state', '$timeout', 'Audio', '$log', Friends]);

var Socket;

Socket = (function() {
  function Socket($rootScope, CFG, $log) {
    var o, socket;
    socket = io.connect(CFG.socketUrl);
    o = {
      message: {},
      messages: [],
      on: function(eventName, flash, callback) {
        socket.on(eventName, function() {
          var args, data;
          data = void 0;
          args = [].slice.call(arguments);
          $rootScope.$apply(function() {
            var cb, date;
            if (callback) {
              cb = callback;
              callback = function() {
                data = arguments[0];
                return cb.apply(this, arguments);
              };
              callback.apply(socket, args);
              if (flash) {
                date = new Date().toLocaleString();
                o.messages.push({
                  eventName: eventName,
                  data: data
                });
              }
            }
          });
        });
      },
      emit: function(eventName, data, callback) {
        var args, cb;
        args = [].slice.call(arguments);
        cb = void 0;
        if (typeof args[args.length - 1] === 'function') {
          cb = args[args.length - 1];
          args[args.length - 1] = function() {
            var args;
            args = [].slice.call(arguments);
            $rootScope.$apply(function() {
              if (cb) {
                cb.apply(socket, args);
              }
            });
          };
        }
        socket.emit.apply(socket, args);
      }
    };
    return o;
  }

  return Socket;

})();

angular.module('vkp').factory('Socket', ['$rootScope', 'CFG', '$log', Socket]);

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
