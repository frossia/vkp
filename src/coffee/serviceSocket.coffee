
class Socket extends Factory
	constructor: ($rootScope, CFG, $log) ->

		socket = io.connect(CFG.socketUrl)


		o = {

			message: {}
			messages: []

			on: (eventName, flash, callback) ->
				socket.on eventName, ->
					data = undefined
					args = [].slice.call(arguments)
					$rootScope.$apply ->
						if callback
							cb = callback
							callback = ->
								data = arguments[0]
								cb.apply this, arguments
							callback.apply socket, args

							if flash
								# console.log data
								date = new Date().toLocaleString()
								o.messages.push {eventName, data}
								# angular.copy {eventName, data, "date": date}, o.message
								# o.message = {eventName, data}
								# console.log 'messages', o.messages

						return
					return
				return


			emit: (eventName, data, callback) ->
				args = [].slice.call(arguments)
				cb = undefined
				if typeof args[args.length - 1] == 'function'
					cb = args[args.length - 1]

					args[args.length - 1] = ->
						`var args`
						args = [].slice.call(arguments)
						$rootScope.$apply ->
							if cb
								cb.apply socket, args
							return
						return

				socket.emit.apply socket, args
				return

		}

		return o











