var app = angular.module('bus-meme');

app.controller('NavController', function ($scope, $location, $rootScope) {

    $rootScope.userSignedIn = userSignedIn();

    function userSignedIn() {
        return sessionStorage.getItem('isAuthenticated') === "true";
    }

    $scope.showGallery = function () {
        $location.path('/logan/galleries');
    };

    $scope.showAbout = function () {
        $location.path('/logan/about');
    };

    $scope.signIn = function () {
        $location.path('/admin');
    };
    
    $scope.signOut = function () {
        sessionStorage.setItem('isAuthenticated', "false");
        $rootScope.userSignedIn = false;
        $location.path('/logan');
    };

    $scope.hamburgerClick = function() {
        document.getElementById('tuckedMenu').classList.toggle('custom-menu-tucked');
        document.getElementById('toggle').classList.toggle('x');
    }
});
