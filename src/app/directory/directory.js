angular.module('phone.directory', ['phone.services'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/directory', {
    templateUrl: 'directory/directory.tpl.html',
    pageTitle: 'Directory', 
    controller: 'DirectoryController'});
}])

.controller('DirectoryController', ['$scope', 'DirectoryService', function($scope, DirectoryService) {
  /**
   * Make call to server to obtain the directory.
   */
  $scope.directory = DirectoryService.query();
}]);

