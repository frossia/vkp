vkp.factory('User', [ '$rootScope', '$q', '$state', function( $rootScope, $q, $state ) {


	var vk = {
		apiId: 4761529,
		appPermissions: 8,

		user: {},

		init: function () {
			VK.init({ apiId: vk.apiId });
		},

		checkLogin: function () {
			var d = $q.defer();

			VK.Auth.getLoginStatus(function(res) {
				if (res.session) {
					d.resolve(res)
					// vk.getUser()
				} else {
					d.reject()
					// VK.Auth.login(authInfo, vk.appPermissions);
				}
			});

			return d.promise;
		},

		getUser: function(){

			var d = $q.defer();

			VK.Auth.getLoginStatus(function(response) {
				if (response.session) {
					vk.user.session = response.session;
					VK.Api.call('users.get', { fields: ['photo_100', 'last_seen'] }, function (res) {
						vk.user.info = res.response[0];
						d.resolve( res.response[0] );
						console.log(res)
					})
				} else {
					VK.Auth.login(authInfo, vk.appPermissions);
					// VK.Auth.login();
					console.log('not loginned')
				}

			});

			return d.promise;

		},

		getAudio: function(){
			var d = $q.defer();

			VK.Api.call('audio.get', { owner_id: vk.user.session.mid }, function (res) {
				d.resolve( res.response );
			});

			return d.promise;
		},

		//prepareSong: function(s) {
		//	var d
		//},

		// loginzzz: function(callback){

		// 	function authInfo(response){
		// 		if(response.session){ // Авторизация успешна
		// 			vk.data.user = response.session.user;
		// 			callback(vk.data.user);
		// 		}else {
		// 			alert("Авторизоваться не удалось!");
		// 		}
		// 	}

		// 	VK.Auth.login(authInfo, vk.appPermissions);
		// },

		login: function () {

			function authInfo(response){
				if(response.session){ 
					console.warn('Вы вошли! ', response);
					$state.go("player");
				}else {
					$state.go("login");
					console.error("Авторизоваться не удалось!");
				}
			}

			VK.Auth.login(authInfo, vk.appPermissions);
		},		

		logout: function () {
			VK.Auth.logout( function () {
				$state.go("login")
				console.log('Вы вышли!');
			});
		}

	};


	vk.init();
	return vk;

}]);

