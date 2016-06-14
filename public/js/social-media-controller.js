var app = angular.module('bus-meme');

app.controller('SocialMediaController', function ($scope, $rootScope, $location, $route, MemeFactory, locationUtil, BusMemeConfig) {
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
        return Number(distance.toLowerCase().replace(' km', '').replace('walk: ', '')) * BusMemeConfig.KM_TO_METER_FACTOR;
    }

    $scope.saveImage = function (callback) {
        if ($rootScope.imageLink) {
            callback($rootScope.imageLink);
        }
        else {
            $scope.downloadCanvas();

            var imageDetails = {
                imageUrl: $rootScope.imageUrl,
                otherMode: $scope.other.mode,
                otherModeTravelTime: convertToMiliseconds($scope.other.duration),
                otherModeTravelDistance: convertToMeters($scope.other.distance),
                publicModeTravelTime: convertToMiliseconds($scope.public.duration),
                publicModeTravelDistance: convertToMeters($scope.public.distance),
                user: $scope.user
            };

            MemeFactory.saveImageDetails(imageDetails).then(function (response) {
                var imageLink = encodeURIComponent(response.data.imageLink);
                $rootScope.imageLink = locationUtil.getLocationPath() + '/meme?image=' + imageLink;
                callback($rootScope.imageLink);
            });
        }
    };

    $scope.facebookShare = function () {
        $scope.saveImage(function (imageLink) {
            var facebookShareOpts = {
                method: 'share',
                href: imageLink,
                hashtag: '#' + BusMemeConfig.HASH_TAG,
                quote: $rootScope.memeText
            };
            FB.ui(facebookShareOpts, function (response) {
                console.log(response);
            });
        });
    };

    $scope.twitterShare = function () {
        $scope.saveImage(function (imageLink) {

            var tweetLength = 140;
            var tweetText = $rootScope.memeText;
            var hashtag = ' %23' + BusMemeConfig.HASH_TAG;

            if (tweetText.length + imageLink.length + hashtag.length > tweetLength) {
                tweetText = tweetText.substring(0, tweetLength - hashtag.length - imageLink.length - 2) + '..';
            }

            tweetText = tweetText + hashtag;
            window.open("https://twitter.com/intent/tweet?text=" + tweetText + "&url=" + imageLink,
                '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
        });
    };

    $scope.reloadPage = function () {
        $rootScope.imageLink = '';
        $route.reload();
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
            MemeFactory.saveUserDetails($scope.user).then(function (response) {
                $scope.subscribed = true;
            });
        }
    }
});
