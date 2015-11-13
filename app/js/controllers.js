
vkp.controller('mainCtrl', [ '$rootScope', '$scope', '$interval', 'User', function ($rootScope, $scope, $interval, User) {

	$rootScope.test = 'TESTING';
	$rootScope.loggedIn = false;
	$scope.curVal = 225;
	// $scope.nextVal = 225;

	// $interval( function() {
	// 	// $scope.preVal = $scope.curVal;
	// 	$scope.nextVal = $scope.curVal - 10;


	// }, 1500);

	


	$scope.login = function () {
		User.login();
	}		

	$scope.logout = function () {
		User.logout();
	}	

}]);


vkp.controller('playerCtrl', [ '$scope', 'User', 'userInfo', function ($scope, User, userInfo) {

	$scope.getFriendSongs = function (friend) {
		id = friend.uid
		VK.Api.call('audio.get', { owner_id: id, count: 5 }, function (res) {
			res.response.splice(0,1);
			console.log(res);
			// vk.friends = res.response;
		})		
	};

	User.getAudio().then( function (data) {
		$scope.songs = User.songs
		$scope.friends = User.friends;
	});
	// }

}]);

vkp.controller('loginCtrl', [ '$scope', 'User', function ($scope, User) {
	$scope.test = 'Login Controller';
	$scope.User = User;

	//$scope.ttt = function() {
	//	console.log('ttt')
	//}
}]);

