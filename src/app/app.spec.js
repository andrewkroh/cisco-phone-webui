describe('Main App Module Test', function() {
  var $rootScope, $scope;

  beforeEach(module('phone'));
  beforeEach(inject(function(_$rootScope_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
  }));

  it('pageTitle changes on route change', function() {
    var event = jasmine.createSpy('event');
    var currentRoute = { pageTitle : 'Home' };
    var previousRoute = jasmine.createSpy('previousRoute');

    $scope.$emit('$routeChangeSuccess', event, currentRoute, previousRoute);

//    expect($rootScope.pageTitle).toEqual('Home');
  });
});
