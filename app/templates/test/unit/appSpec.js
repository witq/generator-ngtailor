describe('<%= config.name %> application', function () {

  'use strict';

  var scope;

  beforeEach(module('<%= config.name %>'));

  // Loads the controllers
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    $controller('AppController', {$scope: scope});
  }));

  it('should have a success message initialized', inject(function () {
    expect(scope.message).toBeTruthy();
    expect(scope.message).toBe('Yeahhh! You\'re ready!');
  }));

});
