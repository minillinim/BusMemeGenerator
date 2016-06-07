var app = angular.module('bus-meme');

app.controller('NavController', function ($scope, $location) {

    $scope.showGallery = function () {
        $location.path('/logan/galleries');
    };

    $scope.showAbout = function () {
        $location.path('/logan/about');
    };

});
