var app = angular.module('bus-meme');

app.controller('GalleryController', function ($scope, $location, MemeFactory) {
    $scope.images = [];
    $scope.travelMode = 'driving';

    MemeFactory.getImages().then(function (response) {
        $scope.images = response.data
    });

    $scope.showHomePage = function () {
        $location.path('');
    }

    $scope.formatDistance = function (distance) {
        if (distance < 1000)
            return distance + "m";
        else {
            var distanceInKm = distance / 1000;
            return distanceInKm + "km";
        }
    }
    $scope.formatTravelTime = function (time) {
        var timeInMinutes = time / (60000);
        if (timeInMinutes < 60) {
            return timeInMinutes + " mins";
        }
        else {
            var hours = (timeInMinutes / 60).toFixed(0);
            var minutesLeft = timeInMinutes - (hours * 60);
            return hours + " hrs " + minutesLeft + " mins";
        }
    }
});

app.filter('transportMode', function () {
    return function (images, transportMode) {
        if (transportMode && images.length > 0) {
            return images.filter(function (image) {
                return image.otherMode === transportMode.toLowerCase();
            })
        } else {
            return images;
        }
    };
});