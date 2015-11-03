
vkp.controller('mainCtrl', [ '$rootScope', '$scope', 'User', function ($rootScope, $scope, User) {

	$rootScope.test = 'TESTING';
	$rootScope.loggedIn = false;

	$scope.login = function () {
		User.login();
	}		

	$scope.logout = function () {
		User.logout();
	}	

}]);


vkp.controller('playerCtrl', [ '$scope', 'User', 'userInfo', function ($scope, User, userInfo) {

	$scope.userInfo = userInfo;

}]);

vkp.controller('loginCtrl', [ '$scope', 'User', function ($scope, User) {
	$scope.test = 'Login Controller';
	$scope.User = User;

	//$scope.ttt = function() {
	//	console.log('ttt')
	//}
}]);

