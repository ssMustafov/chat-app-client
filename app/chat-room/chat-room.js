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
            'RoomService', 'UsersService', 'Notification',
            function ($scope, $routeParams, chatService, eventService, chatEvents, identityService, roomService, usersService, notification) {
        var roomId = $routeParams.id;

        function parse(message) {
            var date = typeof (message.receivedDate) === 'string' ? parseInt(message.receivedDate)
                : message.receivedDate;
            return {
                author: message.user,
                date: new Date(date),
                text: message.data
            };
        }

        function loadMessages() {
            chatService.getMessagesForRoom(roomId).then(function (data) {
                data = data.reverse();
                data.forEach(function (message) {
                    onMessage({
                        receivedDate: message.sentOn,
                        user: message.user,
                        data: message.message
                    })
                });
                incrementCount();
            });
        }

        $scope.search = function () {
            var term = $scope.searchTerm;
            if (term) {
                chatService.searchInRoom(roomId, term).then(function (data) {
                    data = data.reverse();
                    $scope.model.messages = [];
                    data.forEach(function (message) {
                        onMessage({
                            receivedDate: message.sentOn,
                            user: message.user,
                            data: message.message
                        })
                    });
                });
            }
        };

        $scope.loadOlderMessages = function () {
            chatService.getMessagesForRoom(roomId, $scope.loadCount, $scope.loadCount + 10).then(function (data) {
                data.forEach(function (message) {
                    var parsed = parse({
                        receivedDate: message.sentOn,
                        user: message.user,
                        data: message.message
                    });
                    $scope.model.messages.unshift(parsed);
                });

                incrementCount();
            });
        };

        $scope.clearSearch = function () {
            $scope.searchTerm = undefined;
            $scope.model.messages = [];
            loadMessages();
        };

        $scope.hasMessages = function () {
            return $scope.model && $scope.model.messages && $scope.model.messages.length > 0;
        };

        function incrementCount() {
            $scope.loadCount += 10;
        }

        $scope.loadCount = 0;
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

            $scope.roomToEdit = room;
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
                $scope.model.messages.push(parse(message));
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

        function filterJoinedUsers(arr1, arr2) {
            var difference = _.differenceWith(arr1, arr2, function (a, b) {
                return a.id === b.id;
            });
            return difference;
        }

        function removeUserById(arr, id, inverse) {
            var result = _.remove(arr, function (element) {
                if (inverse) {
                    return element.id != id;
                }
                return element.id === id;
            });
            return result;
        }

        $scope.isCurrentUser = function (id) {
            return $scope.model.user['id'] === id;
        };

        $scope.onSettingsDialogOpen = function () {
            usersService.getAllUsers().then(function (users) {
                $scope.allUsers = filterJoinedUsers(users, $scope.roomUsers);
            });
        };

        $scope.onSettingsDialogClose = function () {
            $scope.allUsers = undefined;
        };

        $scope.addUserToRoom = function (user) {
            roomService.addUserToRoom(roomId, user.id).then(function () {
                $scope.roomUsers.push(user);
                if ($scope.allUsers) {
                    $scope.allUsers = removeUserById($scope.allUsers, user.id);
                }
                $scope.selectedUser = undefined;
            });
        };

        $scope.removeUserFromRoom = function (user) {
            roomService.removeUserFromRoom(roomId, user.id).then(function () {
                $scope.roomUsers = removeUserById($scope.roomUsers, user.id, true);
            });
        };

        $scope.updateRoom = function (isValid, room) {
            if (isValid && room['name']) {
                roomService.updateRoom(room).then(function (data) {
                    $scope.roomName = data['name'];
                    $scope.roomDescription = data['description'];
                    $('.room-settings').modal('hide');
                    notification.success({
                        title: 'Success',
                        message: 'Room update successfully'
                    });
                    room = {};
                });
            }
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
        function onSendBtn() {
            chatService.sendMessage({
                user: $scope.model.user,
                data: input.val()
            });
            input.val('');
        }
        $scope.send = onSendBtn;

        loadMessages();

        eventService.subscribe(chatEvents.ON_OPEN, onOpen);
        eventService.subscribe(chatEvents.ON_CLIENT_TIMEOUT, onClientTimeout);
        eventService.subscribe(chatEvents.ON_REOPEN, onReopen);
        eventService.subscribe(chatEvents.ON_TRANSPORT_FAILURE, onTransportFailure);
        eventService.subscribe(chatEvents.ON_MESSAGE, onMessage);
        eventService.subscribe(chatEvents.ON_ERROR, onError);
        eventService.subscribe(chatEvents.ON_RECONNECT, onReconnect);
        eventService.subscribe(chatEvents.ON_CLOSE, onClose);
    }]);