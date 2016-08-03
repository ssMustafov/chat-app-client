'use strict';

// Declare app level module which depends on views, and components
angular.module('chatApp', [
    'ngRoute',
    'chatApp.view1',
    'chatApp.view2',
    'chatApp.version'
]).config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('!');

    $routeProvider.otherwise({redirectTo: '/view1'});
}]);
