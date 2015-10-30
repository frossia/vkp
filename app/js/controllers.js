
vkp.controller('mainCtrl', [ '$scope', 'User', function ($scope, User) {

	$scope.logout = function() {
		User.logout();
		console.log('logouting...');
	};

	User.getUser().then(
		function(data) {
			$scope.user = data;
			console.log($scope.user);
			User.getAudio().then(
				function(data) {
					$scope.audio = data;
					console.log(data);
				}
			);			
		}
	);

}]);

// vkp.controller('loginCtrl', [ '$scope', 'User', function ($scope, User) {
// 	$scope.test = 'Login Controller';
// 	$scope.User = User;
// 	//$scope.ttt = function() {
// 	//	console.log('ttt')
// 	//}
// }]);

