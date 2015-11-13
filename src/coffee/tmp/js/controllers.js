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
