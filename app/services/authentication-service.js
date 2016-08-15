'use strict';

angular.module('chatApp.authentication.service', [])
    .factory('AuthenticationService', ['$http', '$q', '$cookies', '$location', 'BACKEND_API_URL', 'IdentityService', function ($http, $q, $cookies, $location,
                                                                                                                               BACKEND_API_URL, identityService) {
        var AUTHENTICATION_COOKIE_KEY = '__AUTH_KEY__';

        function preserveUserData(data) {
            var accessToken = data['auth_key'];
            $http.defaults.headers.common.Authorization = 'Bearer ' + accessToken;
            $cookies.put(AUTHENTICATION_COOKIE_KEY, accessToken);
        }

        function registerUser(user) {
            var deferred = $q.defer();

            $http.post(BACKEND_API_URL + '/auth/register', user)
                .then(function (response) {
                    preserveUserData(response.data);

                    identityService.requestUserProfile()
                        .then(function () {
                            deferred.resolve(response.data);
                        });
                });

            return deferred.promise;
        }

        function loginUser(user) {
            var deferred = $q.defer();

            $http.post(BACKEND_API_URL + '/auth', user)
                .then(function (response) {
                    preserveUserData(response.data);

                    identityService.requestUserProfile()
                        .then(function () {
                            deferred.resolve(response.data);
                        });
                });

            return deferred.promise;
        }

        function isAuthenticated() {
            return !!$cookies.get(AUTHENTICATION_COOKIE_KEY);
        }

        function logout() {
            $cookies.remove(AUTHENTICATION_COOKIE_KEY);
            $http.defaults.headers.common.Authorization = undefined;
            identityService.removeUserProfile();
            $location.path('/');
        }

        function refreshCookie() {
            if (isAuthenticated()) {
                $http.defaults.headers.common.Authorization = 'Bearer ' + $cookies.get(AUTHENTICATION_COOKIE_KEY);
                identityService.requestUserProfile();
            }
        }

        return {
            registerUser: registerUser,
            loginUser: loginUser,
            isAuthenticated: isAuthenticated,
            refreshCookie: refreshCookie,
            logout: logout
        }
    }]);