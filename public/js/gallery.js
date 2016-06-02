var app = angular.module('bus-meme');

app.controller('GalleryController', function ($scope, $location, MemeFactory) {

    MemeFactory.getImages().then(function (response) {
        $scope.images = response.data
    });

    $scope.showHomePage = function(){
        $location.path('');
    }

});