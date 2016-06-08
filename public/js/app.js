var app = angular.module('bus-meme', ['ngRoute', 'bus-meme.config']);

app.config(function ($routeProvider, $locationProvider) {
    $routeProvider.
    when('/', {
        redirectTo: '/logan'
    }).
    when('/logan', {
        templateUrl: 'views/main.html',
        controller: 'MapController'
    }).
    when('/logan/galleries', {
        templateUrl: 'views/gallery.html',
        controller: 'GalleryController'
    }).
    when('/logan/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutController'
    }).
    when('/logan/meme', {
        templateUrl: 'views/image-viewer.html',
        controller: 'ImageViewController'
    }).
    when('/admin', {
        templateUrl: 'views/admin.html',
        controller: 'AdminController'
    }).
    when('/export', {
        templateUrl: 'views/export.html',
        controller: 'AdminController'
    })
    .otherwise({ redirectTo: '/logan' });

    $locationProvider.html5Mode(true);
});

app.factory('locationUtil', function($location) {
    return {
        getLocationPath: function () {
            var host = $location.host(),
                protocol = $location.protocol(),
                port = $location.port(),
                path = $location.path();
            var locationPath;
            if (port) {
                locationPath = protocol + '://' + host + ':' + port + path;
            } else {
                locationPath = protocol + '://' + host + path;
            }
            console.log(locationPath);
            return locationPath;
        }
    }
});

