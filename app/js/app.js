
var vkp = angular.module('vkp', [
	'ui.router'
])

.config(function ($stateProvider, $urlRouterProvider) {

	$urlRouterProvider.otherwise('/');

	$stateProvider
		.state('main', {
			url: '/',
			templateUrl: 'partials/main.html'
			//controller: 'mainCtrl'
		})
		.state('login', {
			url: '/login',
			templateUrl: 'partials/login',
			controller: 'loginCtrl'
		});

});
