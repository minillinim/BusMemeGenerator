var app = angular.module('bus-meme');

app.controller('SocialMediaController', function ($scope, $rootScope,$location, MemeFactory) {

    var KM_TO_METER_FACTOR = 1000;

    $scope.downloadCanvas = function () {
        var canvas = document.getElementById("canvas");
        $rootScope.imageUrl = canvas.toDataURL('image/png');

        var dl = document.getElementById('dl');
    };

    function convertToTimeStamp(travelTime) {
        return moment.duration({
            hours: 2,
            minutes: 2
        }).asMilliseconds();
    }

    function convertToMeters(distance) {
        return Number(distance.replace(' km', '')) * KM_TO_METER_FACTOR;
    }

    $scope.saveImage = function (callback) {
        if ($rootScope.imageLink) {
            callback($rootScope.imageLink);
            console.log('I already have an image!');
        }
        else {
            $scope.downloadCanvas();
            var imageDetails = {
                imageUrl: $rootScope.imageUrl,
                otherMode: $scope.other.mode,
                otherModeTravelTime: convertToTimeStamp($scope.other.duration),
                otherModeTravelDistance: convertToMeters($scope.other.distance),
                publicModeTravelTime: convertToTimeStamp($scope.public.duration),
                publicModeTravelDistance: convertToMeters($scope.public.distance)
            };

            MemeFactory.saveImageDetails(imageDetails).then(function (response) {
                var baseUrl = $location.absUrl().replace('#/', '');
                var imageLink = encodeURIComponent(response.data.imageLink);
                $rootScope.imageLink = baseUrl + 'image/' + imageLink;
                console.log('saving image!');
                callback($rootScope.imageLink);
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
});
