var app = angular.module('bus-meme');

app.controller('SocialMediaController', function ($scope, $rootScope,$location, MemeFactory) {

    var KM_TO_METER_FACTOR = 1000;

    $scope.user = {};
    $scope.invalidUserInput = false;

    $scope.downloadCanvas = function () {
        var canvas = document.getElementById("canvas");
        $rootScope.imageUrl = canvas.toDataURL('image/png');

        var dl = document.getElementById('dl');
    };

    function convertToMiliseconds(travelTime) {
        var timeArray = travelTime.split(' ');
        return moment.duration({
            hours: timeArray.length > 2 ? timeArray[0] : 0,
            minutes: timeArray.length === 2 ? timeArray[0] : timeArray[0]
        }).asMilliseconds();
    }

    function convertToMeters(distance) {
        return Number(distance.replace(' km', '')) * KM_TO_METER_FACTOR;
    }

    $scope.saveImage = function (callback) {
        if ($rootScope.imageLink) {
            callback($rootScope.imageLink);
        }
        else {
            $scope.downloadCanvas();

            console.log($scope.other);

            var imageDetails = {
                imageUrl: $rootScope.imageUrl,
                otherMode: $scope.other.mode,
                otherModeTravelTime: convertToMiliseconds($scope.other.duration),
                otherModeTravelDistance: convertToMeters($scope.other.distance),
                publicModeTravelTime: convertToMiliseconds($scope.public.duration),
                publicModeTravelDistance: convertToMeters($scope.public.distance)
            };

            MemeFactory.saveImageDetails(imageDetails).then(function (response) {
                var baseUrl = $location.absUrl().replace('#/', '');
                var imageLink = encodeURIComponent(response.data.imageLink);
                $rootScope.imageLink = baseUrl + 'image/' + imageLink;
            });
        }
    };

    $scope.facebookShare = function() {
        console.log('facebook share');
        $scope.saveImage(function(imageLink){
            window.open("https://www.facebook.com/sharer/sharer.php?u=" + imageLink +
                "&t="+ $rootScope.memeText, '',
                'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
        });
    };

    $scope.instagramShare = function() {
        // $scope.saveImage(function(imageLink){});
    };

    $scope.twitterShare = function() {
        $scope.saveImage(function(imageLink){
            window.open("https://twitter.com/intent/tweet?text=" + $rootScope.memeText + "&url=" + imageLink,
                '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
        });
    };

    function validEmail(email) {
        return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+$/.test(email);
    }

    function validUser(user) {
        if (user.fullName && user.email) {
            return validEmail(user.email);
        }
    }

    $scope.saveUserDetails = function () {
        $scope.invalidUserInput = !validUser($scope.user);
        
        if (!$scope.invalidUserInput) {
            $scope.subscribed = true;
        }
    }
});
