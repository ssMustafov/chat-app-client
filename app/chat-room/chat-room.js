'use strict';

angular.module('chatApp.chat.room', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/chat/room/:id', {
            templateUrl: 'chat-room/chat-room.html',
            controller: 'ChatRoomCtrl',
            data: {
                requireAuthentication: true
            }
        });
    }])
    .controller('ChatRoomCtrl', ['$scope', '$routeParams', 'ChatService', 'EventService', 'CHAT_EVENTS', 'IdentityService',
            'RoomService', 'UsersService',
            function ($scope, $routeParams, chatService, eventService, chatEvents, identityService, roomService, usersService) {
        var roomId = $routeParams.id;

        $scope.model = {
            transport: 'websocket',
            messages: []
        };

        identityService.getCurrentUser().then(function (user) {
            $scope.model.user = user;
        });

        roomService.getRoomById(roomId).then(function (room) {
            $scope.roomName = room['name'];
            $scope.roomDescription = room['description'];
            $scope.roomUsers = room['users'];
            $scope.connected = true;
            chatService.subscribe(roomId);
        });

        function onOpen(response) {
            $scope.model.transport = response.transport;
            $scope.model.content = 'Atmosphere connected using ' + response.transport;
        }

        function onClientTimeout(request) {
            $scope.model.content = 'Client closed the connection after a timeout. Reconnecting in '
                + request.reconnectInterval;
        }

        function onReopen(response) {
            $scope.model.content = 'Atmosphere re-connected using ' + response.transport;
        }

        function onTransportFailure(request) {
            $scope.model.header = 'Atmosphere Chat. Default transport is WebSocket, fallback is '
                + request.fallbackTransport;
        }

        function onMessage(message) {
            if ($scope.connected) {
                var date = typeof (message.receivedDate) === 'string' ? parseInt(message.receivedDate)
                    : message.receivedDate;
                $scope.model.messages.push({
                    author: message.user,
                    date: new Date(date),
                    text: message.data
                });
            }
        }

        function onClose() {
            $scope.model.content = 'Server closed the connection after a timeout';
        }

        function onError() {
            $scope.model.content = "Sorry, but there's some problem with your socket or the server is down";
        }

        function onReconnect(request) {
            $scope.model.content = 'Connection lost. Trying to reconnect ' + request.reconnectInterval;
        }

        $scope.isCurrentUser = function (id) {
            return $scope.model.user['id'] === id;
        };

        $scope.onSettingsDialogOpen = function () {
            usersService.getAllUsers().then(function (users) {
                $scope.allUsers = users;
            });
        };

        $scope.onSettingsDialogClose = function () {
            $scope.allUsers = undefined;
        };

        var input = $('#input');
        input.keydown(function (event) {
            var me = this;
            var msg = $(me).val();
            if (msg && msg.length > 0 && event.keyCode === 13) {
                $scope.$apply(function () {
                    chatService.sendMessage({
                        user: $scope.model.user,
                        data: msg
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