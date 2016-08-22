'use strict';

angular.module('chatApp.main.common', [])
    .controller('MainController', [
        '$scope', '$location',
        'IdentityService', 'AuthenticationService', 'AUTH_EVENTS', 'EventService', 'RoomService', 'Notification',
        function ($scope, $location, identityService, authenticationService, AUTH_EVENTS, eventService, roomService, notification) {
            $scope.logout = function () {
                authenticationService.logout();
                $scope.currentUser = undefined;
                $scope.isAuthenticated = false;
            };

            function onLogin() {
                identityService.getCurrentUser().then(function (user) {
                    $scope.currentUser = user;
                    $scope.isAuthenticated = true;

                    roomService.getRooms(user.id).then(function (data) {
                        $scope.rooms = data;
                    });
                });
            }

            $scope.openRoom = function (roomId) {
                $location.path('/chat/room/' + roomId);
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

            onLogin();

            eventService.subscribe(AUTH_EVENTS.LOGGED_IN, onLogin);
        }]);