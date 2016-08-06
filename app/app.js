'use strict';

angular.module('chatApp', [
    'ngRoute',
    'chatApp.chat.room',
    'chatApp.view2',
    'chatApp.version',
    'chatApp.constants'
]).config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('!');

    $routeProvider.otherwise({redirectTo: '/chat/room/1'});
}]);
