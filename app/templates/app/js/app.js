(function() {

  'use strict';

  angular.module('<%= config.name %>', [<%= angularDeps %>]);

  <% if (angularProviders.length) {%>

  angular
    .module('<%= config.name %>')
    .config(function(<%= angularProviders %>) {

    });

  <% } %>

})();
