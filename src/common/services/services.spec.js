describe('phone.services Module Tests', function() {
  beforeEach(module('phone.services'));

  it('phone.services module has a DirectoryService', inject(function(DirectoryService) {
    expect(DirectoryService).toBeDefined();
  }));

  it('Directory.query() makes a RESTful HTTP GET call', inject(function(DirectoryService, $httpBackend) {
    // Sanity checks:
    expect($httpBackend).toBeDefined();
    expect(DirectoryService).toBeDefined();

    // Mock the HTTP GET response:
    var TITLE = 'Corporate Directory';
    $httpBackend.expect('GET', 'rest/app/directory/web')
      .respond(200, { title: TITLE });

    // Make the call under test:
    var directoryResponse = DirectoryService.query();

    // Simulate the asynchronous HTTP response:
    $httpBackend.flush();

    // Verify the response:
    expect(directoryResponse).not.toBeNull();
    expect(directoryResponse.title).toEqual(TITLE);
  }));
});
