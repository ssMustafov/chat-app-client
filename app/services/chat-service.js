'use strict';

angular.module('chatApp.chat.service', [])
    .constant('CHAT_EVENTS', {
        'ON_OPEN': 'ON_OPEN',
        'ON_CLOSE': 'ON_CLOSE',
        'ON_CLIENT_TIMEOUT': 'ON_CLIENT_TIMEOUT',
        'ON_REOPEN': 'ON_REOPEN',
        'ON_TRANSPORT_FAILURE': 'ON_TRANSPORT_FAILURE',
        'ON_MESSAGE': 'ON_MESSAGE',
        'ON_ERROR': 'ON_ERROR',
        'ON_RECONNECT': 'ON_RECONNECT'
    })
    .factory('ChatService', ['BACKEND_URL', 'AtmosphereService', 'EventService', 'CHAT_EVENTS', 'AUTH_EVENTS',
            function (backendUrl, atmosphereService, eventService, CHAT_EVENTS, AUTH_EVENTS) {
        var socket;
        var request = {};

        var url = backendUrl.replace(/http\:|https\:/, "ws:");

        function buildRequest(roomId) {
            request = {
                url: url + '/chat/' + roomId,
                contentType: 'application/json',
                logLevel: 'debug',
                transport: 'websocket',
                fallbackTransport: 'websocket',
                trackMessageLength: true,
                reconnectInterval: 5000,
                maxReconnectOnClose: 500,
                reconnectOnServerError: true,
                enableXDR: true,
                timeout: 0,
                shared: true
            };


            request.onOpen = function (response) {
                eventService.fire(CHAT_EVENTS.ON_OPEN, {
                    transport: response.transport
                });
            };

            request.onClose = function (response) {
                eventService.fire('ON_CLOSE');
            };

            request.onClientTimeout = function (response) {
                setTimeout(function () {
                    socket = atmosphereService.subscribe(request);
                }, request.reconnectInterval);

                eventService.fire(CHAT_EVENTS.ON_CLIENT_TIMEOUT, {
                    reconnectInterval: request.reconnectInterval
                });
            };

            request.onReopen = function (response) {
                eventService.fire(CHAT_EVENTS.ON_REOPEN, {
                    transport: response.transport
                });
            };

            request.onTransportFailure = function (errorMsg) {
                atmosphere.util.info(errorMsg);

                eventService.fire(CHAT_EVENTS.ON_TRANSPORT_FAILURE, {
                    fallbackTransport: request.fallbackTransport
                });
            };

            request.onMessage = function (response) {
                var responseText = response.responseBody;
                try {
                    var message = atmosphere.util.parseJSON(responseText);
                    if (message.user['username']==='system') {
                        console.log(message);
                    } else {
                        eventService.fire(CHAT_EVENTS.ON_MESSAGE, {
                            user: message.user,
                            receivedDate: message.receivedDate,
                            data: message.data
                        });
                    }
                } catch (e) {
                    console.error("Error parsing JSON: ", responseText);
                    throw e;
                }
            };

            request.onError = function (response) {
                eventService.fire(CHAT_EVENTS.ON_ERROR);
            };

            request.onReconnect = function (request, response) {
                eventService.fire(CHAT_EVENTS.ON_RECONNECT, {
                    reconnectInterval: request.reconnectInterval
                });
            };
        }

        function unsubscribe() {
            atmosphereService.unsubscribe();
        }

        function subscribe() {
            socket = atmosphereService.subscribe(request);
        }

        eventService.subscribe(AUTH_EVENTS.LOGGED_OUT, unsubscribe);

        return {
            subscribe: function (roomId) {
                if (socket) {
                    unsubscribe();
                }
                buildRequest(roomId);
                subscribe();
            },
            sendMessage: function (message) {
                socket.push(atmosphere.util.stringifyJSON(message));
            }
        }
    }]);