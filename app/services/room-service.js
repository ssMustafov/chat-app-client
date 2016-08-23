'use strict';

angular.module('chatApp.room.service', [])
    .factory('RoomService', ['$http', '$q', 'BACKEND_API_URL', function ($http, $q, BACKEND_API_URL) {

        function getRooms(userId) {
            var deferred = $q.defer();
            $http.get(BACKEND_API_URL + '/rooms?userId=' + userId).then(function (response) {
                deferred.resolve(response.data);
            });
            return deferred.promise;
        }

        function getRoomById(id) {
            var deferred = $q.defer();
            $http.get(BACKEND_API_URL + '/rooms/' + id).then(function (response) {
                deferred.resolve(response.data);
            });
            return deferred.promise;
        }

        function createRoom(data) {
            var deferred = $q.defer();
            $http.post(BACKEND_API_URL + '/rooms', data).then(function (response) {
                deferred.resolve(response.data);
            });
            return deferred.promise;
        }

        function addUserToRoom(roomId, userId) {
            var data = {
                roomId: roomId,
                userId: userId
            };
            var deferred = $q.defer();
            $http.post(BACKEND_API_URL + '/rooms/add/user', data).then(function (response) {
                deferred.resolve(response.data);
            });
            return deferred.promise;
        }

        function removeUserFromRoom(roomId, userId) {
            var data = {
                roomId: roomId,
                userId: userId
            };
            var deferred = $q.defer();
            $http.post(BACKEND_API_URL + '/rooms/remove/user', data).then(function (response) {
                deferred.resolve(response.data);
            });
            return deferred.promise;
        }

        function updateRoom(room) {
            var data = {
                roomId: room.id,
                name: room.name,
                description: room.description
            };
            var deferred = $q.defer();
            $http.put(BACKEND_API_URL + '/rooms', data).then(function (response) {
                deferred.resolve(response.data);
            });
            return deferred.promise;
        }

        return {
            getRooms: getRooms,
            getRoomById: getRoomById,
            createRoom: createRoom,
            addUserToRoom: addUserToRoom,
            removeUserFromRoom: removeUserFromRoom,
            updateRoom: updateRoom
        }
    }]);