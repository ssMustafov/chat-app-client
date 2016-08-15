'use strict';

angular.module('chatApp.main.common', [])
    .controller('MainController', [
        '$scope',
        'IdentityService', 'AuthenticationService',
        function ($scope, identityService, authenticationService) {
            identityService.getCurrentUser()
                .then(function (user) {
                    $scope.currentUser = user;
                    $scope.isAuthenticated = true;
                });

            $scope.logout = function () {
                authenticationService.logout();
                $scope.currentUser = undefined;
                $scope.isAuthenticated = false;
            }
        }]);