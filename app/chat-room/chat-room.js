'use strict';

angular.module('chatApp.chat.room', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/chat/room/:id', {
            templateUrl: 'chat-room/chat-room.html',
            controller: 'ChatRoomCtrl'
        });
    }])
    .controller('ChatRoomCtrl', ['$scope', '$routeParams', 'ChatService', 'EventService', 'CHAT_EVENTS', function ($scope, $routeParams, chatService, eventService, chatEvents) {
        $scope.model = {
            transport: 'websocket',
            messages: []
        };

        function onOpen(response) {
            $scope.model.transport = response.transport;
            $scope.model.connected = true;
            $scope.model.content = 'Atmosphere connected using ' + response.transport;
        }

        function onClientTimeout(request) {
            $scope.model.content = 'Client closed the connection after a timeout. Reconnecting in '
                + request.reconnectInterval;
            $scope.model.connected = false;
        }

        function onReopen(response) {
            $scope.model.connected = true;
            $scope.model.content = 'Atmosphere re-connected using ' + response.transport;
        }

        function onTransportFailure(request) {
            $scope.model.header = 'Atmosphere Chat. Default transport is WebSocket, fallback is '
                + request.fallbackTransport;
        }

        function onMessage(message) {
            if (!$scope.model.logged && $scope.model.name)
                $scope.model.logged = true;
            else {
                var date = typeof (message.time) === 'string' ? parseInt(message.time)
                    : message.time;
                $scope.model.messages.push({
                    author: message.author,
                    date: new Date(date),
                    text: message.message
                });
            }
        }

        function onClose() {
            $scope.model.connected = false;
            $scope.model.content = 'Server closed the connection after a timeout';
        }

        function onError() {
            $scope.model.content = "Sorry, but there's some problem with your socket or the server is down";
            $scope.model.logged = false;
        }

        function onReconnect(request) {
            $scope.model.content = 'Connection lost. Trying to reconnect ' + request.reconnectInterval;
            $scope.model.connected = false;
        }

        var input = $('#input');
        input.keydown(function (event) {
            var me = this;
            var msg = $(me).val();
            if (msg && msg.length > 0 && event.keyCode === 13) {
                $scope.$apply(function () {
                    // First message is always the author's name
                    if (!$scope.model.name)
                        $scope.model.name = msg;

                    chatService.sendMessage({
                        author: $scope.model.name,
                        message: msg
                    });
                    $(me).val('');
                });
            }
        });

        eventService.subscribe(chatEvents.ON_OPEN, onOpen);
        eventService.subscribe(chatEvents.ON_CLIENT_TIMEOUT, onClientTimeout);
        eventService.subscribe(chatEvents.ON_REOPEN, onReopen);
        eventService.subscribe(chatEvents.ON_TRANSPORT_FAILURE, onTransportFailure);
        eventService.subscribe(chatEvents.ON_MESSAGE, onMessage);
        eventService.subscribe(chatEvents.ON_ERROR, onError);
        eventService.subscribe(chatEvents.ON_RECONNECT, onReconnect);
        eventService.subscribe(chatEvents.ON_CLOSE, onClose);
    }]);