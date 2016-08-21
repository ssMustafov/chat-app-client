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

        return {
            getRooms: getRooms,
            getRoomById: getRoomById,
            createRoom: createRoom
        }
    }]);