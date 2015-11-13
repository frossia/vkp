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
