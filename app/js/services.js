vkp.factory('User', [ '$rootScope', '$q', function( $rootScope, $q ) {


	var vk = {
		apiId: 4761529,
		appPermissions: 8,

		userData: {},

		init: function () {
			VK.init({ apiId: vk.apiId });
			//return $q.getUser().then( function (data) {
			//		angular.copy(data, vk.userData)
			//	})
		},

		getUser: function(){

			var d = $q.defer();

			VK.Auth.getLoginStatus(function(response) {
				if (response.session) {
					vk.userData.session = response.session;
					VK.Api.call('users.get', { fields: ['photo_50', 'last_seen'] }, function (res) {
						vk.userData.info = res.response[0];

						d.resolve( res.response[0] );
					})
				} else {
					VK.Auth.login();
					console.log('not loginned')
				}

			});

			return d.promise;

		},

		getAudio: function(){
			var d = $q.defer();

			VK.Api.call('audio.get', { owner_id: vk.userData.session.mid }, function (res) {
				d.resolve( res.response );
			});

			return d.promise;
		},

		//prepareSong: function(s) {
		//	var d
		//},

		login:function(callback){

			function authInfo(response){
				if(response.session){ // Авторизация успешна
					vk.data.user = response.session.user;
					callback(vk.data.user);
				}else {
					alert("Авторизоваться не удалось!");
				}
			}

			VK.Auth.login(authInfo, vk.appPermissions);
		},

		logout:function(){
			VK.Auth.logout();
			console.log('вы вышли');
		}

	};

	vk.init();
	return vk;

}]);

//
//vkp.provider( "myProvider", function () {
//
//	var myVariable = {
//		value: 0
//	};
//
//	this.$get = function(){
//
//		return {
//
//			myVariable: myVariable,
//			increase: function() {
//				myVariable.value++;
//			}
//
//		};
//
//
//	};
//
//} );
