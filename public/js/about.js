var app = angular.module('bus-meme');

app.controller('AboutController', function ($scope, $location) {
    $scope.faqs = [];

    $scope.showHomePage = function () {
        $location.path('/logan');
    }

    $scope.faqs.push({
        "question": "How does this site work?",
        "answer": "Magic"
    });

    $scope.faqs.push({
        "question": "Who made it?",
        "answer": "Magicians"
    });

    /*
    $scope.faqs.push({
        "question": ,
        "answer":
    });
    */

});