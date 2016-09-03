'use strict';

angular.module('chatApp.users.service', [])
    .factory('UsersService', ['$http', '$q', 'BACKEND_API_URL', function ($http, $q, BACKEND_API_URL) {

        function getAllUsers() {
            var deferred = $q.defer();
            $http.get(BACKEND_API_URL + '/users').then(function (response) {
                deferred.resolve(response.data);
            });
            return deferred.promise;
        }

        function updateUser(user) {
            var deferred = $q.defer();
            $http.post(BACKEND_API_URL + '/users/' + user.id, user).then(function (response) {
                deferred.resolve(response.data);
            });
            return deferred.promise;
        }

        return {
            getAllUsers: getAllUsers,
            updateUser: updateUser
        }
    }]);