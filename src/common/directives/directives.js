/* Directives */


angular.module('phone.directives', [])
  .directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])
  .directive('activeLink', ['$location', function(location) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs, controller) {
            var clazz = attrs.activeLink;
            scope.location = location;
            scope.$watch('location.path()', function(newPath) {
                if (attrs.href.substring(1) === newPath) {
                    // Assumes that the parent is <li>
                    element.parent().addClass(clazz);
                } else {
                    element.parent().removeClass(clazz);
                }
            });
        }
    };
  }]);
