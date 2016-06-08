var app = angular.module('bus-meme');

app.controller('AdminController', function ($scope, $location, AuthFactory) {

    $scope.authFail = false;

    if (sessionStorage.getItem('isAuthenticated') == 'true') {
        $location.path('/export');
    }

    $scope.showHomePage = function () {
        $location.path('');
    }

    $scope.userLogin = function () {
         AuthFactory.userLogin($scope.token).then(function (response) {
             console.log('I am here');

            sessionStorage.setItem('isAuthenticated', response.data.isAuthenticated);

            if (sessionStorage.getItem('isAuthenticated')) {
                $location.path('/export');
            }
        }, function(err){
             $scope.authFail = true;
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
