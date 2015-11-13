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
