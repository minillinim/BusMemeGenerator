var app = angular.module('bus-meme');

app.controller('ExportController', function ($scope, $http, $location, AuthFactory) {

    $scope.authFail = false;
    $scope.userSignedIn = false;

    $scope.showHomePage = function () {
        $location.path('');
    };

    $scope.userLogin = function () {
        AuthFactory.userLogin($scope.token).then(function (response) {

            if (response.data.isAuthenticated) {
                $scope.authFail = false;
                $scope.userSignedIn = true;
                $location.path('/export');
            }
        }, function(err){
            $scope.authFail = true;
            $scope.userSignedIn = false;
        });
    };

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
        $http.get('/exportUsers?token=' + $scope.token).then(function (response) {
            dataExport(response.data, 'users');
        });
    };
    $scope.exportMemeTemplates = function() {
        $http.get('/exportMemeTemplates?token=' + $scope.token).then(function (response) {
            dataExport(response.data, 'templates');
        });
    };
    $scope.exportImages = function() {
        $http.get('/exportImages?token=' + $scope.token).then(function (response) {
            dataExport(response.data, 'images');
        });
    };

});

app.factory('AuthFactory', ['$http', function ($http) {
    return {
        userLogin: function (token) {
            return $http.post('/userLogin', {data: token});
        }
    }
}]);


