var app = angular.module('bus-meme');

app.controller('ImageViewController', function ($scope, $location, $routeParams, locationUtil) {
    var imageId = $routeParams.image;
    console.log(imageId);
    if (!imageId) {
        $location.path('/logan');
    } else {
        $scope.imageUrl = locationUtil.getLocationPath().replace('/meme', '') + '/image/' + imageId;
    }

    $scope.showHomePage = function () {
        $location.search({});
        $location.path('/logan');
    };

});
