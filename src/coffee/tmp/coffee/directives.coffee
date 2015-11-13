class Flash
	constructor: ($rootScope, $compile, $templateRequest, Socket) ->
		return {
			restrict: 'E'
			# replace: true
			template: '<div class"fixed"></div>'
			# scope:

			link: (scope, element, attrs) ->
				messages = []
				scope.message = Socket.message
				scope.$watch 'message', ((n, o) ->
					if n != o
						# scope.msg = n.eventName + ' :: ' + n.date || 'UPS......'
						switch n.eventName
							when 'user:new'
								console.log 'newValue', n
								$templateRequest('partials/flashes/info.html').then (html) ->
									tmpl = angular.element html
									element.children('.fixed').html tmpl
									$compile(tmpl) scope
									console.log 'asdasd', element.children()[0]
									animate element.children().children()
									messages.push n
									# console.log 'MESSAGES :: ', n
									return
								# return

						animate = (el) ->
							TweenMax.fromTo el, 1.5,
								{y:-100},
								{y:0, ease:Elastic.easeOut}
								# {scale: 0, opacity: 0, ease:Back.easeIn},
								# {scale: 1, opacity: 1, ease:Elastic.easeOut}

							# TweenMax.to el, 0.8,
							# 	{scale: 0, opacity: 0, ease:Elastic.easeOut, delay: 5}

					return
				), true

				return
		}




class LoginForm
	constructor: ($rootScope, $timeout, $log) ->

		return {
			restrict: 'EA'
			templateUrl: 'partials/loginForm.html'

			link: (scope, element, attrs) ->
				preLogin   = angular.element(document.querySelector('#pre_login'))
				loginBtn   = angular.element(document.querySelector('#login_btn'))
				afterLogin = angular.element(document.querySelector('#user_avatar'))
				data       = angular.element(document.querySelector('#data'))

				loginBtn.bind 'mouseenter', ->
					TweenMax.to preLogin, .5, {
						scale: 1.1, ease:Elastic.easeOut
					}
					TweenMax.to preLogin, 1.5, {
						delay: 0.1, scale:1, ease:Elastic.easeOut
					}
					return

				scope.$watch 'user', (newValue, oldValue) ->
					if scope.user
						TweenMax.to preLogin, 0.6, {
							scale: 0, opacity: 0, display: 'none', ease:Back.easeIn
						}

						TweenMax.fromTo afterLogin, 1,
							{scale: 0, opacity: 0, ease:Back.easeIn},
							{scale: 1, opacity: 1, ease:Elastic.easeOut, delay: 1}

						TweenMax.fromTo data, 1,
							{scale: 0, opacity: 0, ease:Back.easeIn},
							{scale: 1, opacity: 1, ease:Elastic.easeOut, delay: 2}

						return
				return
		}

class Load
	constructor: ($rootScope) ->
		return {
			restrict: 'A'
			templateUrl: 'partials/loading.html'

			link: (scope, element, attr) ->

				s = Snap('#loading')
				# path = 'M0 0 C 20 80, 40 80, 50 60'
				# var bigCircle = s.path(path);
				r = 35
				c2 = s.circle(40, 40, r).attr
					fill: 'transparent'
					stroke: 'red'
					strokeWidth: 1
					strokeDasharray: circleLength
					strokeDashoffset: circleLength

				c = s.circle(40, 40, r)

				circleLength = 2*Math.PI*r

				c.attr
					fill: 'transparent'
					stroke: '#fff'
					strokeWidth: 10
					transform: 'rotate(-90 40 40)'
					strokeDasharray: circleLength
					strokeDashoffset: circleLength

				scope.$watch 'loadingPercent', (newValue, oldValue) ->
					val = circleLength - (circleLength * newValue / 100)
					c.animate({strokeDashoffset: val}, 10, mina.easeinout)
					return

		}



class Imageonload
	constructor: ->
		return {
			restrict: 'A'
			link: (scope, element, attrs) ->
				element.bind 'load', ->
					element.addClass 'loaded'
					return
				return
		}




class NoImage
	constructor: ->
		return {
			restrict: 'A'
			link: (scope, element, attrs) ->
				attrs.$observe 'noImage', (value) ->

					getRandomColor = ->
						letters = '0123456789ABCDEF'.split('')
						color = '#'
						k = 0
						while k < 6
							color += letters[Math.floor(Math.random() * 16)]
							k++
						color

					if value == 'true'
						id = attrs.hash.replace(':', '')
						# console.log(element);
						element.addClass 'no-image'
						canvas = angular.element('<svg id=' + id + ' class="svg-no-image"></svg>')
						canvas.addClass 'anim'
						element.prepend canvas
						draw = Snap('#' + id)
						# rects = [];
						i = 0
						while i < 10
							j = 0
							while j < 10
								draw.rect(i * 30, j * 30, 30, 30).attr fill: getRandomColor()
								# console.log('ss')
								j++
							i++
						# c = draw.circle(150,150,100);
						# console.log(draw);
					return
				# if
				# console.log(attrs);
				# if scope.son
				# element.bind('load', function() {
				# });
				return

		}




angular.module('vkp')
.directive('flash', ['$rootScope', '$compile', '$templateRequest', 'Socket', Flash])
.directive('loginForm', ['$rootScope', '$timeout', '$log', LoginForm])
.directive('load', ['$rootScope', Load])
.directive('imageonload', [Imageonload])
.directive('noImage', [NoImage])