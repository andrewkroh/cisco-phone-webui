angular.module('phone.notifier', ['phone.services'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/notifier', {
        templateUrl: 'notifier/notifier.tpl.html',
        pageTitle: 'Notifier',
        controller: 'NotifierController',
        resolve: {
            formOptions: ['NotifierService', function (NotifierService) {
                return NotifierService.options().$promise;
            }]
        }
    });
}])

.controller('NotifierController', ['$scope', 'formOptions', 'NotifierService', '$timeout',
    function ($scope, formOptions, NotifierService, $timeout) {

        // ID assigned to the current notification by the server.
        var statusPoller;

        var StatusPoller = function (statusId) {
            var self = this;
            this.statusId = statusId;
            this.stopped = true;

            this.poll = function () {
                console.log('poll');
                if (!self.stopped) {
                    console.log('making call');
                    NotifierService.status({ id: self.statusId },
                        function (successResult) {
                            self.callback(successResult);
                            if (!self.stopped) {
                                $timeout(self.poll, 1000);
                            }
                        });
                }
            };

            this.start = function (callback) {
                this.callback = callback;
                this.stopped = false;
                this.poll();
            };

            this.stop = function () {
                this.stopped = true;
                console.log('stopped');
            };
        };

        $scope.formOptions = formOptions;

        // Set the default form options:
        $scope.audibleAlert = $scope.formOptions.audibleAlerts[0];
        $scope.timeout = $scope.formOptions.timeouts[0];
        $scope.extensions = [ $scope.formOptions.extensions[0] ];

        $scope.AlertState = {
            ACKNOWLEDGED: 'ACKNOWLEDGED',
            SENT: 'SENT',
            TIMEDOUT: 'TIMEDOUT',
            IN_USE: 'IN_USE'
        };

        $scope.notifierState = undefined;

        $scope.awaitingSubmit = true;
        $scope.success = false;
        $scope.error = false;

        $scope.notify = function () {
            var extensionNumbers = [];
            for (var i = 0; i < $scope.extensions.length; i++) {
                extensionNumbers.push($scope.extensions[i].telephoneNumber);
            }

            // RESTful call is pending:
            $scope.disabled = true;

            NotifierService.notify({}, {
                    message: $scope.message,
                    extensions: extensionNumbers,
                    audibleAlert: $scope.audibleAlert.id,
                    timeout: $scope.timeout.id
                },
                function (successResult) {
                    console.log("Success");
                    console.log(successResult);

                    // Button State
                    $scope.awaitingSubmit = false;
                    $scope.success = true;
                    $scope.error = false;

                    $scope.alertState = $scope.AlertState.SENT;

                    statusPoller = new StatusPoller(successResult.id);
                    statusPoller.start(function (statusResponse) {
                        console.log("Status Response 123: " + statusResponse);

                        // Status value needs to map to an enum state.
                        // TODO: add a timeout value
                        $scope.alertState = statusResponse.status;
                        $scope.acknowledgeTime = statusResponse.acknowledgeTime;
                        $scope.acknowledgeExtensionName = statusResponse.acknowledgeExtensionName;
                        $scope.alertState = $scope.AlertState.IN_USE;
                    });
                },
                function (errorResult) {
                    console.log("Failure");
                    console.log(errorResult);

                    // Button State
                    $scope.awaitingSubmit = false;
                    $scope.success = false;
                    $scope.error = true;

                    $scope.disabled = false;
                });
        };

        $scope.cancel = function () {
            // RESTful call is pending:
            $scope.disabled = false;

            // Button State
            $scope.awaitingSubmit = true;
            $scope.success = false;
            $scope.error = false;

            // Alert State for Header
            $scope.alertState = undefined;

            if (statusPoller) {
                statusPoller.stop();
                NotifierService.cancel({ id: statusPoller.statusId });
                console.log('Stopping statusPoller.' + statusPoller);
            }
        };

        $scope.restart = function () {
            // RESTful call is pending:
            $scope.disabled = false;

            // Button State
            $scope.awaitingSubmit = true;
            $scope.success = false;
            $scope.error = false;

            // Alert State for Header
            $scope.alertState = undefined;

            if (statusPoller) {
                NotifierService.restart({ id: statusPoller.statusId });
                statusPoller.start();
                console.log('Restarting statusPoller.' + statusPoller);
            }
        };
    }]);

