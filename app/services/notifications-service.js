'use strict';

angular.module('chatApp.notifications.service', [])
    .factory('NotificationsService', ['BACKEND_URL', function (BACKEND_URL) {
        var webSocket;
        var url = BACKEND_URL.replace(/http\:|https\:/, "ws:");

        function openWebSocket(onMessageCallback) {
            // Ensures only one connection is open at a time
            if (webSocket !== undefined && webSocket.readyState !== WebSocket.CLOSED) {
                console.log('WebSocket is already opened');
                return;
            }

            var webSocketUrl = url + '/notifications';
            webSocket = new WebSocket(webSocketUrl);

            webSocket.onopen = function(event) {
                console.log('Connection opened');
            };

            webSocket.onclose = function(event) {
                console.log('Connection closed');
            };

            webSocket.onerror = function(event) {
                console.error(event);
            };

            webSocket.onmessage = function(event) {
                if (_.isFunction(onMessageCallback)) {
                    onMessageCallback(JSON.parse(event.data));
                }
            };

            waitForSocketConnection(webSocket);
        }

        function waitForSocketConnection(webSocket, callback) {
            setTimeout(function() {
                if (webSocket.readyState === WebSocket.OPEN) {
                    if (callback) {
                        callback();
                    }
                    return;
                } else {
                    waitForSocketConnection(webSocket, callback);
                }
            }, 50);
        }

        return {
            start: openWebSocket
        }
    }]);