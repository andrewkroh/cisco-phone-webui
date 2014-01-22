angular.module('phone-dev', ['phone', 'ngMockE2E'])

    .run(function ($httpBackend) {

        var directory = {
            "title": "Test Directory",
            "directoryEntries": [
                {"name": "Test Data", "telephoneNumber": "99"},
                {"name": "Stone Ridge (All Phones)", "telephoneNumber": "100"},
                {"name": "SR - Kitchen", "telephoneNumber": "101"},
                {"name": "SR - Master Bedroom", "telephoneNumber": "102"},
                {"name": "SR - Office", "telephoneNumber": "103"},
                {"name": "SR - Living Room", "telephoneNumber": "104"},
                {"name": "SR - Garage", "telephoneNumber": "105"},
                {"name": "SR - Bedroom East", "telephoneNumber": "106"},
                {"name": "SR - Bedroom West", "telephoneNumber": "107"},
                {"name": "Pennsylvania (All Phones)", "telephoneNumber": "200"},
                {"name": "PA - Living Room", "telephoneNumber": "201"},
                {"name": "Paging (One-way)", "telephoneNumber": "9"}
            ]};

        $httpBackend.whenGET('rest/app/directory/web').respond(directory);

        var audibleAlerts = [
            {id: '0', name: 'Sonar'},
            {id: '1', name: 'Beep'},
            {id: '2', name: 'Fire alarm'},
            {id: '3', name: 'Chime'},
            {id: '4', name: 'Whistle'}
        ];

        var timeouts = [
            {id: '0', name: '15 sec'},
            {id: '1', name: '30 sec'},
            {id: '2', name: '60 sec'},
            {id: '3', name: '3 min'},
            {id: '4', name: '10 min'}
        ];

        var formOptions = {
            'audibleAlerts': audibleAlerts,
            'timeouts': timeouts,
            'extensions': directory.directoryEntries
        };

        $httpBackend.whenGET('rest/app/notifier/options').respond(formOptions);

        var newResponse = { id: 1234 };

        $httpBackend.whenPOST('rest/app/notifier/new',function (data) {
            // Convert string to JSON object:
            var jsonData = JSON.parse(data);

            // Ignore POST if the message is 'FAILURE'.
            return jsonData.message.toLowerCase() != "failure";
        }).respond(newResponse);

        $httpBackend.whenPOST('rest/app/notifier/new').respond(400);

        $httpBackend.whenGET(/rest\/app\/notifier\/[\d]+\/status/,function (data) {
            console.log('Server received status callback.');
            return true;
        }).respond({
                status: 'ACKNOWLEDGED',
                acknowledgeTime: Date.now(),
                acknowledgeExtensionName: 'SR - Master Bedroom' });

        $httpBackend.whenPOST(/rest\/app\/notifier\/[\d]+\/cancel/,function (data) {
            console.log('Server received cancel callback.');
            return true;
        }).respond(200);
    });
