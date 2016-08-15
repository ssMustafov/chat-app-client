'use strict';

angular.module('chatApp.identity.service', [])
    .factory('IdentityService', ['$http', '$q', 'BACKEND_API_URL', function ($http, $q, BACKEND_API_URL) {
        var deferred = $q.defer();

        var currentUser = undefined;

        return {
            getCurrentUser: function () {
                if (currentUser) {
                    return $q.when(currentUser);
                }
                else {
                    return deferred.promise;
                }
            },
            removeUserProfile: function () {
                currentUser = undefined;
            },
            requestUserProfile: function () {
                var userProfileDeferred = $q.defer();

                $http.get(BACKEND_API_URL + '/auth/me')
                    .then(function (response) {
                        currentUser = response.data;
                        deferred.resolve(currentUser);
                        userProfileDeferred.resolve();
                    });

                return userProfileDeferred.promise;
            }
        };
    }]);