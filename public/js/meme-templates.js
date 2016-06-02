var app = angular.module('bus-meme');

app.controller('MemeController', function ($scope, $rootScope, $location, MemeFactory, $anchorScroll) {

    MemeFactory.getMemeTemplates().then(function (response) {

        $scope.memeTemplates = response.data;
        $scope.selectedTemplate = '';

   		$scope.memeTemplates = response.data;

    });

    $scope.setSelectedTemplate = function (template) {
        $scope.selectedTemplate = template;
        $scope.renderMeme();
    };

    $scope.renderMeme = function () {
        var image = document.getElementById("img-out");
        var canvas = document.getElementById("canvas");
        var context = canvas.getContext("2d");

        var topText = $scope.selectedTemplate.firstLine;
        var bottomText = $scope.selectedTemplate.secondLine;

        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        context.textAlign = "center";
        context.fillStyle = "white";
        context.strokeStyle = "black";
        context.lineWidth = 2;
        writeTextOnImage(context, topText, canvas.width / 2, 70);
        writeTextOnImage(context, bottomText, canvas.width / 2, canvas.height - 30);
        // downloadLink.href = canvas.toDataURL("image/jpeg");
        $('#img-out').hide();
        $rootScope.imageLink = '';
        $rootScope.memeText = $scope.selectedTemplate.firstLine + ' - ' + $scope.selectedTemplate.secondLine;
    };

    function convertToTimeStamp(travelTime) {
        var timeArray = travelTime.split(' ');
        return moment.duration({
            hours: timeArray.length > 2 ? timeArray[0] : 0,
            minutes: timeArray.length === 2 ? timeArray[0] : timeArray[0]
        }).asMilliseconds();
    }

    function convertToMeters(distance) {
        return Number(distance.replace(' km', '')) * KM_TO_METER_FACTOR;
    }


    $scope.shareImage = function () {
        document.getElementById('map-results').classList.add('done');
        $rootScope.showImage = true;

        scrollToElement('invisible-map-anchor');
    };

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
                console.log($rootScope.imageLink);
                callback($rootScope.imageLink);
            });
        }
    };
    $scope.facebookShare = function () {

        $scope.saveImage(function (imageLink) {
            window.open("https://www.facebook.com/sharer/sharer.php?u=" + imageLink +
                "&t=" + $rootScope.memeText, '',
                'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
        });
    };
    $scope.instagramShare = function () {

        $scope.saveImage(function (imageLink) {

        });
    };
    $scope.twitterShare = function () {
        $scope.saveImage(function (imageLink) {
            window.open("https://twitter.com/intent/tweet?text=" + $rootScope.memeText + "&url=" + imageLink,
                '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
        });
    };

    function scrollToElement(id) {
        setTimeout(function () {
            console.log('wth');
            $anchorScroll(id);
        }, 10);
    }

    function writeTextOnImage(context, text, x, y) {
        var f = 36;
        for (; f >= 0; f -= 1) {
            context.font = "bold " + f + "pt Impact, Charcoal, sans-serif";
            if (context.measureText(text).width < canvas.width - 10) {
                context.fillText(text, x, y);
                context.strokeText(text, x, y);

                break;
            }
        }
    }
});

app.factory('MemeFactory', ['$http', function ($http) {
    return {
        getMemeTemplates: function () {
            return $http.get('/getMemeTemplates');
        },
        saveImageDetails: function (imageDetails) {
            return $http.post('/saveImage', {data: imageDetails});
        },
        getImages: function () {
            return $http.get('/getImages');
        }
    }
}]);

