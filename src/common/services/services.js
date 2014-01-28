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
}])

.service('StatusService', ['$timeout', 'NotifierService',
        function($timeout, NotifierService) {

    var self = this;
    this.POLLING_INTERVAL_MS = 1000;
    this.statusId = null;
    this.stopped = true;
    this.timeoutPromise = null;

    this.poll = function () {
        console.log('poll');

        if (!self.stopped && self.statusId !== null) {
            console.log('making call');

            NotifierService.status(
                { id: self.statusId },
                function (successResult) {
                    self.callback(successResult);
                    if (!self.stopped) {
                        self.timeoutPromise = 
                                $timeout(self.poll, self.POLLING_INTERVAL_MS);
                    }
                },
                function (errorResult) {
                    if (!self.stopped) {
                        self.timeoutPromise = 
                                $timeout(self.poll, self.POLLING_INTERVAL_MS);
                    }
                }
            );
        }
    };

    this.start = function (statusId, callback) {
        this.statusId = Preconditions.checkNotUndefined(statusId, 
                'statusId cannot be undefined.');
        this.callback = Preconditions.checkNotUndefined(callback,
                'callback cannot be undefined.');

        this.stop();
        this.stopped = false;
        this.poll();
    };

    this.stop = function () {
        console.log('stopped');
        this.stopped = true;

        if (this.timeoutPromise !== null)
        {
            $timeout.cancel(this.timeoutPromise);
        }
    };
}]);
