'use strict';

angular.module('chatApp.account.register', [])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/account/register', {
            templateUrl: 'account/register/register.html',
            controller: 'RegisterController'
        });
    }])
    .controller('RegisterController', ['$scope', '$location', 'AuthenticationService', function ($scope, $location, authenticationService) {
        if (authenticationService.isAuthenticated()) {
            $location.path('/');
        }

        $scope.register = function (isValid, user) {
            if (isValid && user && user['username'] && user['password'] && user['email']) {
                authenticationService.registerUser(user)
                    .then(function() {
                        $location.path('/');
                    });
            }
        };
    }]);