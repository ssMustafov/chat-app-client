'use strict';

angular.module('chatApp.atmosphere.service', [])
    .factory('AtmosphereService', function ($rootScope) {
        var responseParameterDelegateFunctions = ['onOpen', 'onClientTimeout', 'onReopen', 'onMessage', 'onClose', 'onError'];
        var delegateFunctions = responseParameterDelegateFunctions;
        delegateFunctions.push('onTransportFailure');
        delegateFunctions.push('onReconnect');

        return {
            subscribe: function (request) {
                var result = {};
                angular.forEach(request, function (value, property) {
                    if (typeof value === 'function' && delegateFunctions.indexOf(property) >= 0) {
                        if (responseParameterDelegateFunctions.indexOf(property) >= 0)
                            result[property] = function (response) {
                                if (!$rootScope.$$phase) {
                                    $rootScope.$apply(function () {
                                        request[property](response);
                                    });
                                }
                            };
                        else if (property === 'onTransportFailure')
                            result.onTransportFailure = function (errorMsg, request) {
                                $rootScope.$apply(function () {
                                    request.onTransportFailure(errorMsg, request);
                                });
                            };
                        else if (property === 'onReconnect')
                            result.onReconnect = function (request, response) {
                                $rootScope.$apply(function () {
                                    request.onReconnect(request, response);
                                });
                            };
                    } else
                        result[property] = request[property];
                });

                return atmosphere.subscribe(result);
            },
            unsubscribe: function () {
                atmosphere.unsubscribe();
            }
        };
    });