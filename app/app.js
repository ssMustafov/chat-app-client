'use strict';

angular.module('chatApp', [
    'ngRoute',
    'chatApp.view1',
    'chatApp.view2',
    'chatApp.version',
    'chatApp.constants'
]).config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('!');

    $routeProvider.otherwise({redirectTo: '/view1'});
}]);
