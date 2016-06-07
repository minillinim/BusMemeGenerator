var app = angular.module('bus-meme');

app.controller('AboutController', function ($scope, $location) {
    $scope.faqs = [];

    $scope.showHomePage = function () {
        $location.path('/logan');
    }

    $scope.faqs.push({
        "question": "How does this site work?",
        "answer": "We query the Google Maps and Translink journey planner APIs and then combine the results to make the meme."
    });

    $scope.faqs.push({
        "question": "Who made this site?",
        "answer": "The original concept came from the good folks at the Queensland Community Alliance. The site was put together over a 2 week period by some hard working devs at the Brisbane ThoughtWorks office."
    });

    $scope.faqs.push({
        "question": "I'm from <INSERT CITY>, why doesn't the site accept my address?",
        "answer": "Right now we've limited the site to journeys with at least one of the origin or destination in Logan City"
    });

    $scope.faqs.push({
        "question": "Will you include my city in future releases?",
        "answer": "Short answer: 'YES, maybe, soon', Long answer: please email michael.imelfort@gmail.com with more details about your #publictransportfail."
    });

    $scope.faqs.push({
        "question": "Feature ... doesn't seem to work properly / My question wasn't listed here!!",
        "answer": "Please email michael.imelfort@gmail.com with details about any bugs or  questions."
    });

    /*
    $scope.faqs.push({
        "question": ,
        "answer":
    });
    */

});