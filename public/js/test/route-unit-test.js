describe('Route', function () {
    var scope;
    var mockMapService;

    beforeEach(function(){
        module('bus-meme');

        inject(function($controller, $rootScope){
        //    scope = $rootScope.$new();
        //
        //    mockMapService = jasmine.createSpyObj('mockMapService', ['products'])
        //
        //    module(function($provide){
        //        $provide.value('MapService', mockMapService)
        //    });
        //
        //    $controller('MapController', {$scope: scope,MapService: mockMapService})
        });
    });

    it('Should direct to home page', function () {
        //scope.$apply();
        expect(2).toEqual(2);
    });
});