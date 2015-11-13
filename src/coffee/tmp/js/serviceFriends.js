var Friends;

Friends = (function() {
  function Friends($rootScope, $q, $state, $timeout, Audio, $log) {
    var o;
    o = {
      friends: [],
      getFriends: function() {
        var d, promises, vkExecuteFriendsGet;
        vkExecuteFriendsGet = function(offset) {
          var code, execPromise;
          execPromise = $q.defer();
          code = 'var users = []; var data = []; var count = 0; users = API.friends.get({"count": "20", "offset": ' + offset + ', "order": "hints", "fields": ["photo_50"] }); while(count < users.length) { var info = API.users.get( { "user_ids": users[count].uid, "fields": "photo_50, photo_100, can_see_audio, counters" } ); data.push(info); count = count + 1; } return data;';
          VK.api('execute', {
            code: code
          }, function(data) {
            data.response.map(function(friend, i) {
              friend[0].id = offset + i;
              if (!('deactivated' in friend[0])) {
                friend[0].counters.count = Object.keys(friend[0].counters).length;
                o.friends.push(friend[0]);
              }
            });
            execPromise.resolve(data);
          });
          return execPromise.promise;
        };
        d = $q.defer();
        promises = [];
        VK.api('execute', {
          code: 'return API.friends.get();'
        }, function(data) {
          var friendsCount, j, offset, prm, ref, zzzdata;
          friendsCount = data.response.length;
          $log.log("friendsCount: " + friendsCount);
          zzzdata = [];
          for (offset = j = 0, ref = friendsCount; j <= ref; offset = j += 20) {
            prm = vkExecuteFriendsGet(offset);
            promises.push(prm);
          }
          return $q.all(promises).then(function() {
            d.resolve();
          });
        });
        return d.promise;
      }
    };
    return o;
  }

  return Friends;

})();

angular.module('vkp').factory('Friends', ['$rootScope', '$q', '$state', '$timeout', 'Audio', '$log', Friends]);
