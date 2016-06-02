var app = angular.module('bus-meme');

app.controller('GalleryController', function ($scope, $location, MemeFactory) {
    $scope.images = [];
    $scope.travelMode = 'driving';

    MemeFactory.getImages().then(function (response) {
        $scope.images = response.data
    });

    $scope.showHomePage = function () {
        $location.path('');
    }
});

app.filter('transportMode', function () {
    return function (images, transportMode) {
        if (transportMode && images.length > 0) {
            return images.filter(function (image) {
                return image.otherMode === transportMode.toLowerCase();
            })
        } else {
            return images;
        }
    };
});