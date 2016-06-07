var app = angular.module('bus-meme');

app.controller('AdminController', function ($scope, $location, AuthFactory) {
    $scope.userLogin = function () {
        AuthFactory.userLogin($scope.token).then(function (response) {
            if (response.data.isAuthenticated) {
                $location.path('/export');
            }
        });
    }
});

app.factory('AuthFactory', ['$http', function ($http) {
    return {
        userLogin: function (token) {

            return $http.post('/userLogin', {data: token});
        }
    }
}]);
