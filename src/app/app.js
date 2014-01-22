// Declare app level module which depends on filters, and services
angular.module('phone', [
  'ngRoute',
  'phone.home',
  'phone.directory',
  'phone.notifier',
  'phone.filters',
  'phone.services',
  'phone.directives',
  'templates-app',
  'templates-common'
])

.run(['$rootScope', function($rootScope) {
  /**
   * Automatically update the page title upon page change.
   */
  $rootScope.$on("$routeChangeSuccess", function(event, currentRoute, previousRoute) {
      $rootScope.pageTitle = currentRoute.pageTitle;
  });
}])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise( {
    redirectTo: '/home'});
}]);
