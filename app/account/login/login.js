'use strict';

angular.module('chatApp.account.login', [])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/account/login', {
            templateUrl: 'account/login/login.html',
            controller: 'LoginController'
        });
    }])
    .controller('LoginController', ['$scope', '$location', 'AuthenticationService', function ($scope, $location, authenticationService) {
        if (authenticationService.isAuthenticated()) {
            $location.path('/');
        }

        $scope.login = function (isValid, user) {
            if (isValid && user && user['username'] && user['password']) {
                authenticationService.loginUser(user)
                    .then(function () {
                        $location.path('/');
                    });
            }
        };
    }]);