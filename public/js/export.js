var app = angular.module('bus-meme');

app.controller('ExportController', function ($scope, $location, AuthFactory) {

});

app.factory('AuthFactory', ['$http', function ($http) {
    return {
        export: function () {

            return $http.get('/exportUsers');
        }
    }
}]);
