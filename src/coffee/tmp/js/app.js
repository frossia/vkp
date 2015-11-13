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
