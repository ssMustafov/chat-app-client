'use strict';

angular.module('chatApp', [
    'ngRoute',
    'chatApp.chat.room',
    'chatApp.view2',
    'chatApp.version',
    'chatApp.constants',
    'chatApp.atmosphere.service',
    'chatApp.chat.service',
    'chatApp.event.service',
    'blockUI'
]).config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('!');

    $routeProvider.otherwise({redirectTo: '/chat/room/1'});
}])
.run(['EventService', 'blockUI', 'CHAT_EVENTS', function (eventService, blockUi, chatEvents) {
    eventService.subscribe(chatEvents.ON_OPEN, function () {
        blockUi.stop();
    });
    eventService.subscribe(chatEvents.ON_CLOSE, function () {
        blockUi.start('Trying to connect to the server...');
    });
    eventService.subscribe(chatEvents.ON_REOPEN, function () {
        blockUi.stop();
    });
}]);
