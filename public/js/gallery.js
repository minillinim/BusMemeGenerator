var app = angular.module('bus-meme');

app.controller('GalleryController', function ($scope, MemeFactory) {

    MemeFactory.getImages().then(function (response) {
        $scope.images = response.data
    });

});