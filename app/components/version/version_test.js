'use strict';

describe('chatApp.version module', function() {
  beforeEach(module('chatApp.version'));

  describe('version service', function() {
    it('should return current version', inject(function(version) {
      expect(version).toEqual('0.1');
    }));
  });
});
