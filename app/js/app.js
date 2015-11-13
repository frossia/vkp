// document.addEventListener("DOMContentLoaded", function(event) { 

// });

var vkp = angular.module('vkp', [
	'ui.router'
])

.config(function ($stateProvider, $urlRouterProvider) {

	$stateProvider
		.state('player', {
			url: '/player',
			resolve: { 
				userInfo: function (User) {
					return User.getUser()
				}
			},
			templateUrl: 'partials/player.html',
			controller: 'playerCtrl'
		})
		.state('login', {
			url: '/',
			templateUrl: 'partials/login.html',
			controller: 'loginCtrl'
		});

	$urlRouterProvider.otherwise('/');

});



vkp.run(['$state', '$log', '$rootScope', '$timeout', 'User', function($state, $log, $rootScope, $timeout, User) {
  $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
		if (toState.name === 'login') {
			User.checkLogin().then( function (res) {
				$state.go('player');
			})
		} else if (toState.name === 'player') {
			User.checkLogin().then( null , function (err) {
				$state.go('login');	
			})
		}; 	

  });
}]);

