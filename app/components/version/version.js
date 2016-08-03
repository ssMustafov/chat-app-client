'use strict';

angular.module('chatApp.version', [
  'chatApp.version.interpolate-filter',
  'chatApp.version.version-directive'
])

.value('version', '0.1');
