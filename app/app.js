'use strict';

angular.module('chatApp', [
    'ngRoute',
    'ngCookies',
    'chatApp.chat.room',
    'chatApp.account.login',
    'chatApp.account.register',
    'chatApp.main.common',
    'chatApp.constants',
    'chatApp.atmosphere.service',
    'chatApp.chat.service',
    'chatApp.event.service',
    'chatApp.authentication.service',
    'chatApp.identity.service',
    'ui-notification',
    'blockUI'
]).config(['$locationProvider', '$routeProvider', '$httpProvider', 'NotificationProvider', function ($locationProvider, $routeProvider, $httpProvider, notificationProvider) {
    $locationProvider.hashPrefix('!');

    $routeProvider.otherwise({redirectTo: '/chat/room/1'});

    notificationProvider.setOptions({
        delay: 5000,
        startTop: 60,
        startRight: 20,
        verticalSpacing: 20,
        horizontalSpacing: 20,
        positionX: 'right',
        positionY: 'top'
    });

    $httpProvider.interceptors.push(['$q', function($q) {
        return {
            'responseError': function(rejection) {
                console.log(rejection);


                return $q.reject(rejection);
            }
        }
    }]);
}])
    .constant('jQuery', $)
    .run(['$rootScope', '$location', 'AuthenticationService', 'EventService', 'blockUI', 'CHAT_EVENTS', function ($rootScope, $location, authenticationService,
                                                                                                                  eventService, blockUi, chatEvents) {
        $rootScope.$on('$routeChangeStart', function(event, next) {
            if (next['data']) {
                var routeData = next['data'];
                if (routeData['requireAuthentication'] && !authenticationService.isAuthenticated()) {
                    event.preventDefault();
                    $location.path('/account/login');
                }
            }

        });

        authenticationService.refreshCookie();

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
