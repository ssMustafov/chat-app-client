'use strict';

angular.module('chatApp.authentication.service', [])
    .constant('AUTH_EVENTS', {
        'LOGGED_IN': 'LOGGED_IN',
        'LOGGED_OUT': 'LOGGED_OUT'
    })
    .factory('AuthenticationService', ['$http', '$q', '$cookies', '$location', 'BACKEND_API_URL', 'AUTH_EVENTS', 'IdentityService', 'EventService',
        function ($http, $q, $cookies, $location, BACKEND_API_URL, AUTH_EVENTS, identityService, eventService) {
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
                                eventService.fire(AUTH_EVENTS.LOGGED_IN);
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
                                eventService.fire(AUTH_EVENTS.LOGGED_IN);
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
                eventService.fire(AUTH_EVENTS.LOGGED_OUT);
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