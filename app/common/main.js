'use strict';

angular.module('chatApp.main.common', [])
    .controller('MainController', [
        '$scope', '$location', '$cookies', '$translate', '$window',
        'IdentityService', 'AuthenticationService', 'AUTH_EVENTS', 'EventService', 'RoomService', 'Notification', 'UsersService',
        'NotificationsService',
        function ($scope, $location, $cookies, $translate, $window, identityService, authenticationService, AUTH_EVENTS,
                  eventService, roomService, notification, usersService, notificationsService) {
            var LANGUAGE_COOKIE_KEY = '__USER_LANGUAGE__';

            $scope.logout = function () {
                authenticationService.logout();
                $scope.currentUser = undefined;
                $scope.isAuthenticated = false;
            };

            function getUserLanguage() {
                return $cookies.get(LANGUAGE_COOKIE_KEY);
            }

            function setLanguage() {
                var userLanguage = getUserLanguage() || 'en';
                $translate.use(userLanguage);
            }

            function onLogin() {
                identityService.getCurrentUser().then(function (user) {
                    $scope.currentUser = user;
                    $scope.isAuthenticated = true;

                    roomService.getRooms(user.id).then(function (data) {
                        $scope.rooms = data;
                        notificationsService.start(processNotifications);
                    });

                    $scope.userToEdit = _.assign({}, user);
                });
            }

            function processNotifications(notification) {
                if (notification.type === 'message') {
                    processMessageNotification(notification);
                }
                if (notification.type === 'joined') {
                    processJoinedNotification(notification);
                }
                if (notification.type === 'left') {
                    processLeftNotification(notification);
                }
            }
            
            function processLeftNotification(notification) {
                if (notification.user.id === $scope.currentUser.id) {
                    removeRoomFromList(notification.roomId);
                    if ($scope.isActiveRoom(notification.roomId)) {
                        $location.path('/chat/room/' + $scope.rooms[0].id);
                    }
                } else {
                    eventService.fire('USER_LEFT', notification.user);
                }
            }
            
            function removeRoomFromList(roomId) {
                roomId = parseInt(roomId) || '';
                _.remove($scope.rooms, function(room) {
                    return room.id === roomId;
                });
            }

            function processJoinedNotification(notification) {
                if (!roomExists(notification.roomId)) {
                    roomService.getRoomById(notification.roomId).then(function (room) {
                        $scope.rooms.push(room);
                    });
                }
                if ($scope.isActiveRoom(notification.roomId)) {
                    eventService.fire('USER_JOINED', {
                        user: notification.user
                    });
                }
            }

            function roomExists(roomId) {
                roomId = parseInt(roomId) || '';
                for (var i = 0; i < $scope.rooms.length; i++) {
                    if ($scope.rooms[i].id === roomId) {
                        return true;
                    }
                }
                return false;
            }

            function processMessageNotification(notification) {
                function doesRoomHaveBadge(element) {
                    return !!element.has('span').length;
                }

                function appendBadge(element) {
                    element.append('<span class="badge"><span class="glyphicon glyphicon-comment"></span></span>');
                }

                function selectRoomFromList(roomId) {
                    return $('#room-' + roomId);
                }

                var roomId = notification.roomId;
                if ($scope.isActiveRoom(roomId)) {
                    return;
                }

                var element = selectRoomFromList(roomId);
                if (!doesRoomHaveBadge(element)) {
                    appendBadge(element);
                }
            }

            function removeBadge(roomId) {
                $('#room-' + roomId + ' .badge').remove();
            }

            $scope.openRoom = function (roomId) {
                $location.path('/chat/room/' + roomId);
                removeBadge(roomId);
            };

            $scope.createRoom = function (isValid, room) {
                if (isValid && room && room['name']) {
                    roomService.createRoom(room).then(function (data) {
                        $scope.rooms.push(data);
                        $location.path('/chat/room/' + data['id']);
                        $('.create-room-modal').modal('hide');
                        notification.success({
                            title: 'Success',
                            message: 'Room created successfully'
                        });
                        $scope.roomToCreate = {};
                    });
                }
            };

            $scope.isActiveRoom = function (id) {
                var path = $location.path();
                var i = path.lastIndexOf('/');
                var currentId = path.substring(i+1);
                return currentId === id + '';
            };

            $scope.updateUser = function (isValid, user) {
                if (isValid && user) {
                    var payload = {};
                    if (user['name'] !== $scope.currentUser['name']) {
                        payload.name = user['name'];
                    }
                    if (user['email'] !== $scope.currentUser['email']) {
                        payload.email = user['email'];
                    }
                    if (user['image']) {
                        payload.image = user['image'];
                    }
                    if (Object.keys(payload).length > 0) {
                        payload.id = $scope.currentUser.id;
                        usersService.updateUser(payload).then(function () {
                            $('.user-settings-modal').modal('hide');
                            $scope.logout();
                        });
                    }
                }
            };

            $scope.updatePassword = function (isValid, password) {
                if (isValid && password) {
                    authenticationService.changePassword(password).then(function () {
                        $('.user-settings-modal').modal('hide');
                        $scope.logout();
                    });
                }
            };

            $scope.changeLanguage = function () {
                $cookies.remove(LANGUAGE_COOKIE_KEY);
                $cookies.put(LANGUAGE_COOKIE_KEY, $scope.userLanguage);
                setLanguage();
                $window.location.reload();
            };

            $scope.imageChangeHandler = function (event, reader, file, fileList, arr, encodedFile) {
                if (encodedFile.filesize > 1400000) {
                    reader.abort();
                } else {
                    $scope.userImage = 'data:' + encodedFile.filetype + ';base64,' + encodedFile.base64;
                    $scope.userToEdit.image = $scope.userImage;
                }
            };

            setLanguage();
            onLogin();

            eventService.subscribe(AUTH_EVENTS.LOGGED_IN, onLogin);
        }]);