/* Services */
angular.module('phone.services', ['ngResource'])

.factory('DirectoryService', ['$resource', function($resource) {
  return $resource('rest/app/directory/web', {}, {
    query: {
      method: 'GET'
    }
  });
}])

.factory('NotifierService', ['$resource', function($resource) {
  var PATH = 'rest/app/notifier';
  return $resource(PATH, {}, {
    options: {
      method: 'GET',
      url: PATH + '/options',
      cache: true
    },
    notify: {
      method: 'POST',
      url: PATH + '/new'
    },
    cancel: {
      method: 'POST',
      url: PATH + '/:id/cancel',
      params: { id: '@id' }
    },  
    restart: {
      method: 'POST',
      url: PATH + '/:id/restart',
      params: { id: '@id' }
    },
    status: {
      method: 'GET',
      url: PATH + '/:id/status',
      params: { id: '@id' }
    }
  });
}]);
