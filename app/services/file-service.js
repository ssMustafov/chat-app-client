'use strict';

angular.module('chatApp.file.service', [])
    .factory('FileService', ['$http', '$q', 'BACKEND_API_URL', 'AuthenticationService', 'FileUploader', function ($http, $q, BACKEND_API_URL, authenticationService, FileUploader) {
        function getFilesForRoom(roomId) {
            var deferred = $q.defer();
            $http.get(BACKEND_API_URL + '/files/' + roomId).then(function (response) {
                deferred.resolve(response.data);
            });
            return deferred.promise;
        }

        return {
            getUploader: function () {
                return new FileUploader({
                    url: BACKEND_API_URL + '/files/upload',
                    headers: {
                        Authorization: authenticationService.getToken()
                    }
                });
            },
            getFilesForRoom: getFilesForRoom
        }
    }]);