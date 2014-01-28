var Preconditions = {
    checkArgument: function(condition, message) {
        if (!condition) {
            throw new Error('IllegalArgumentException: ' + (message || ''));
        }
    },
    checkNotUndefined: function(reference, message) {
        if (typeof reference === undefined) {
            throw new Error('UndefinedReferenceException: ' + (message || ''));
        }

        return reference;
    }
};

(function(){
"use strict";

/**
 * Status of the notification service.
 *
 * @param alertState {string} state of the notifier service, cannot be undefined
 * @param statusId
 * @param ackTime
 * @param ackExtension
 * @constructor
 */
var Status = function(alertState, statusId, ackTime, ackExtension) {
    Preconditions.checkArgument(alertState === 'AVAILABLE' ||
        alertState === 'ACKNOWLEDGED' || alertState === 'SENT' ||
        alertState === 'TIMED_OUT' || alertState === 'IN_USE',
        'State must be AVAILABLE, ACKNOWLEDGED, SENT, TIMED_OUT, or IN_USE ' +
        'but was <' + alertState + '>.');
    this.alertState = alertState;

    if (alertState !== 'AVAILABLE') {
        this.statusId = Preconditions.checkNotUndefined(statusId,
            'Status ID is cannot be undefined.');
    }

    if (alertState === 'ACKNOWLEDGED') {
        this.acknowledgementTime = Preconditions.checkNotUndefined(ackTime,
            'Acknowledgement time cannot be undefined.');
        this.acknowledgementExtensionName = Preconditions.checkNotUndefined(
            ackExtension, 'Acknowledgement extension cannot be undefined.');
    }
};

angular.module('phone.notifier', ['phone.services'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/notifier', {
        templateUrl: 'notifier/notifier.tpl.html',
        pageTitle: 'Notifier',
        controller: 'NotifierController',
        resolve: {
            formOptions: ['NotifierService', function (NotifierService) {
                return NotifierService.options().$promise;
            }],
            status: ['NotifierService', function (NotifierService) {
                return NotifierService.options().$promise;
            }]
        }
    });
    $routeProvider.when('/notifier/:statusId', {
        templateUrl: 'notifier/notifier.tpl.html',
        pageTitle: 'Notifier',
        controller: 'NotifierController',
        resolve: {
            formOptions: function (NotifierService) {
                return NotifierService.options().$promise;
            },
            status: function ($route, NotifierService) {
                return NotifierService.status(
                    { id: $route.current.params.statusId }).$promise;
            }
        }
    });
}])

.controller('NotifierController', ['$scope', '$route', 'StatusService', 'NotifierService',
        function ($scope, $route, StatusService, NotifierService) {

    var setStatus = function(status) {
        Preconditions.checkNotUndefined(status, "Status cannot be undefined.");
        $scope.alertState = status.alertState;
        $scope.acknowledgeTime = status.acknowledgementTime;
        $scope.acknowledgeExtensionName = status.acknowledgeExtensionName;

        switch (status.alertState) {
            case 'AVAILABLE':
                setButtonState('INITIAL');
                $scope.disabled = false;
                break;
            case 'ACKNOWLEDGED':
                setButtonState('INITIAL');
                $scope.disabled = false;
                break;
            case 'SENT':
                setButtonState('SUCCESS');
                $scope.disabled = true;
                break;
            case 'TIMED_OUT':
                setButtonState('INITIAL');
                $scope.disabled = true;
                break;
            case 'IN_USE':
                setButtonState('INITIAL');
                $scope.disabled = true;
                break;
            default:
                throw new Error('IllegalArgumentException: Unhandled alert ' +
                                'state <' + formState + '>.');
        }
    };

    var setButtonState = function(buttonState) {
        switch (buttonState) {
            case 'INITIAL':
                $scope.awaitingSubmit = true;
                $scope.success = false;
                $scope.error = false;
                break;
            case 'SUCCESS':
                $scope.awaitingSubmit = false;
                $scope.success = true;
                $scope.error = false;
                break;
            case 'ERROR':
                $scope.awaitingSubmit = false;
                $scope.success = false;
                $scope.error = true;
                break;
            default:
                throw new Error('IllegalArgumentException: Unhandled button ' +
                                'state <' + buttonState + '>.');
        }
    };

    var setOperationPending = function(isPending) {
        $scope.disabled = isPending;
    };

    $scope.formOptions = $route.current.locals.formOptions;

    // Set the default form options:
    $scope.audibleAlert = $scope.formOptions.audibleAlerts[0];
    $scope.timeout = $scope.formOptions.timeouts[0];
    $scope.extensions = [ $scope.formOptions.extensions[0] ];
    $scope.notifierState = undefined;
    setButtonState('INITIAL');

    $scope.notify = function () {
        setOperationPending(true);

        var extensionNumbers = [];
        for (var i = 0; i < $scope.extensions.length; i++) {
            extensionNumbers.push($scope.extensions[i].telephoneNumber);
        }

        NotifierService.notify({},
            {
                message: $scope.message,
                extensions: extensionNumbers,
                audibleAlert: $scope.audibleAlert.id,
                timeout: $scope.timeout.id
            },
            function (notifySuccess) {
                setOperationPending(false);
                setStatus(new Status(notifySuccess.status, notifySuccess.statusId));

                StatusService.start(notifySuccess.statusId,
                    function (callbackData) {
                        setStatus(new Status(callbackData.status,
                                callbackData.statusId,
                                callbackData.acknowledgementTime,
                                callbackData.acknowledgementExtensionName));
                    }
                );
            },
            function (errorResult) {
                setOperationPending(false);
                setButtonState('ERROR');

                // If this was an error from the server containing
                // an updated status then display it.
                if (typeof errorResult.data !== undefined)
                { 
                    setStatus(new Status(errorResult.data.status, 
                                         errorResult.data.statusId)); 
                }
            }
        );
    };

    $scope.cancel = function () {
        setOperationPending(true);

        NotifierService.cancel(
            {
                id: $route.params.local.statusId
            },
            function(cancelSuccess) {
                StatusService.stop();
                setStatus(new Status('AVAILABLE'));
                setOperationPending(false);
            },
            function(cancelError) {
                setOperationPending(false);
                setButtonState('ERROR');
            }
        );
    };

    $scope.restart = function () {
        setFormState('PENDING');

        NotifierService.restart(
            {
                id: $route.params.local.statusId
            },
            function(restartSuccess) {
                // TODO: add method to StatusService 
                StatusService.restart();
                setStatus(new Status('SENT', $route.params.local.statusId));
                setOperationPending(false);
            },
            function(restartError) {
                setOperationPending(false);
                setButtonState('ERROR');
            }
        );
    };
}]);

})(); // End IIFE

