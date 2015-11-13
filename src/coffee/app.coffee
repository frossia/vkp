angular.module('vkp', ['ui.router'])

class Cfg extends Constant
	constructor: ->
		return {
			production:   false
			socketUrl:		'http://playerx.dev:8080'
			checkRoutes:  true
			redirect:     true
			debugEnabled: true
			infoEnabled:  true
			songsToLoad:  10
		}


class Routes extends Config
	constructor: ($stateProvider, $urlRouterProvider, $locationProvider, $logProvider, $provide, CFG) ->

		$stateProvider
			.state 'login',
				url: '/'
				templateUrl: 'partials/login.html'
				controller: 'loginController'

			.state 'player',
				url: '/player'
				templateUrl: 'partials/player.html'
				controller: 'playerController'

			.state 'friends',
				url: '/friends'
				templateUrl: 'partials/friends.html'
				controller: 'friendsController'

		$urlRouterProvider.otherwise '/'
		# $locationProvider.html5Mode(true)

		# logEnhancerProvider.prefixPattern = ''
		# logEnhancerProvider.datetimePattern = null

		# $provide.decorator '$controller', [ '$delegate', '$log'
		# 	($delegate, $log) -> (constructor, locals) ->
		# 		$log.info 'Loaded controller :: ' + arguments[0]
		# 		$delegate constructor, locals
		# ]

		$provide.decorator '$log', [ '$delegate'
			($delegate) ->

				origInfo = $delegate.info
				origDebug = $delegate.debug

				$delegate.info = -> origInfo.apply null, arguments if CFG.infoEnabled
				$delegate.debug = -> origDebug.apply null, arguments if CFG.debugEnabled

				$delegate
		]


		return



class checkRoutes extends Run
	constructor: ($state, $log, $rootScope, $timeout, User, CFG) ->

		if (CFG.checkRoutes && !CFG.production)
			$rootScope.$on '$stateChangeStart', (e, toState, toParams, fromState, fromParams) ->
				if toState.name == 'login'
					User.checkLogin().then (res) ->
						$state.go 'player'
						return
				else if toState.name == 'player'
					User.checkLogin().then null, (err) ->
						$state.go 'login'
						return
				return
			# return

		# return



