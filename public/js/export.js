var app = angular.module('bus-meme');

app.controller('ExportController', function ($scope, $http, $location) {

    if (!sessionStorage.getItem('isAuthenticated') || sessionStorage.getItem('isAuthenticated') == 'false') {
        $location.path('');
    }

    var dataExport = function (data, modelName) {
        var element = angular.element('<a/>');
        var today = new Date();
        element.attr({
            href: 'data:attachment/csv;charset=utf-8,' + encodeURI(data),
            target: '_blank',
            download: 'bmeme' + '-' + modelName
                      + '-' +  today.getDate() + '-' + (today.getMonth()+1) + '-' + today.getFullYear()
                      + '.csv'
        })[0].click();
    };

    $scope.exportUsers = function() {
        $http.get('/exportUsers').then(function (response) {
            dataExport(response.data, 'users');
        });
    };
    $scope.exportMemeTemplates = function() {
        $http.get('/exportMemeTemplates').then(function (response) {
            dataExport(response.data, 'templates');
        });
    };
    $scope.exportImages = function() {
        $http.get('/exportImages').then(function (response) {
            dataExport(response.data, 'images');
        });
    };

});


