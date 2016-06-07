var app = angular.module('bus-meme', ['ngRoute']);

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
    otherwise({ redirectTo: '/logan' });

    $locationProvider.html5Mode(true);
});

