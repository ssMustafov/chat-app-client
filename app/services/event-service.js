'use strict';

angular.module('chatApp.event.service', [])
    .service('EventService', [function () {
        return {
            fire: function (topic, data, channel) {
                if (!topic) {
                    throw new TypeError('Topic argument is undefined for EventService.fire');
                }
                var envelope = {
                    topic: topic
                };
                if (channel) {
                    envelope.channel = channel;
                }
                if (data) {
                    envelope.data = data;
                }

                postal.publish(envelope);
            },

            subscribe: function (topic, callback, channel) {
                if (!topic || !callback) {
                    throw new TypeError('Topic and callback arguments are mandatory for EventService.subscribe');
                }
                if (typeof callback !== 'function') {
                    throw new TypeError('The callback argument must be a function for EventService.subscribe');
                }
                var opts = {
                    topic: topic,
                    callback: callback
                };
                if (channel) {
                    opts.channel = channel;
                }

                postal.subscribe(opts);
            }
        }
    }]);