var app = angular.module('bus-meme');

app.config(function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'views/main.html',
        controller: 'MapController'
    }).when('/galleries', {
        templateUrl: 'views/gallery.html',
        controller: 'GalleryController'
    }).when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutController'
    })
});

app.controller('NavController', function ($scope, $location) {

    $scope.showGallery = function () {
        $location.path('/galleries');
    };

    $scope.showAbout = function () {
        $location.path('/about');
    };

});
