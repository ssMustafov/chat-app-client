'use strict';

angular.module('chatApp.main.common', [])
    .controller('MainController', [
        '$scope',
        'IdentityService', 'AuthenticationService', 'AUTH_EVENTS', 'EventService',
        function ($scope, identityService, authenticationService, AUTH_EVENTS, eventService) {
            $scope.logout = function () {
                authenticationService.logout();
                $scope.currentUser = undefined;
                $scope.isAuthenticated = false;
            };

            function onLogin() {
                identityService.getCurrentUser().then(function (user) {
                    $scope.currentUser = user;
                    $scope.isAuthenticated = true;
                });
            }

            onLogin();

            eventService.subscribe(AUTH_EVENTS.LOGGED_IN, onLogin);
        }]);