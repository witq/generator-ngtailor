// jshint ignore: start

(function() {

  'use strict';

  angular
    .module('<%= settings.name %>')
    .controller('AppController', ['$scope', AppController]);

  function AppController ($scope) {

    $scope.message = 'Yeahhh! You\'re ready!';

  };

})();
