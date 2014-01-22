angular.module('phone.home', [])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl: 'home/home.tpl.html',
    pageTitle: 'Phone Controller', 
    controller: 'HomeController'});
}])

.controller('HomeController', [function() {

}]);
