var app = angular.module('bus-meme');

app.controller('GalleryController', function ($scope, $location, MemeFactory) {
    $scope.images = [];
    $scope.travelMode = {driving: true, walking: true};
    $scope.sortOption = 'biggestDifference';
    var ITEMS_PER_PAGE = 12;

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

    $scope.getSortingCriteria = function (sortOption) {
        if (sortOption === "biggestDifference")
            return '(image.otherModeTravelTime - image.publicModeTravelTime)';
        else return '-' + sortOption;
    }

    $scope.getDateDisplay = function (dbDate) {
        var date = new Date(dbDate);
        console.log(date);
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        return date.getDate() + ' ' +
            months[date.getMonth()] + ' ' +
            date.getFullYear();
    }
    /*pagination*/
    $scope.itemsPerPage = ITEMS_PER_PAGE;
    $scope.currentPage = 0;

    $scope.prevPage = function () {
        if ($scope.currentPage > 0) {
            $scope.currentPage--;
        }
    };

    $scope.prevPageDisabled = function () {
        return $scope.currentPage === 0 ? "disabled" : "";
    };

    $scope.pageCount = function () {
        return Math.ceil($scope.images.length / $scope.itemsPerPage);
    };

    $scope.range = function () {
        var range = [];

        console.log($scope.pageCount());
        for (i = 0; i < $scope.pageCount(); i++) {
            range.push(i);
        }

        return range;
    };

    $scope.setPage = function (n) {

        console.log('n:', n);
        if (n < 0)
            return;

        if (n > $scope.pageCount())
            return;

        $scope.currentPage = n;
    }

    $scope.nextPage = function () {
        if ($scope.currentPage < $scope.pageCount() - 1) {
            $scope.currentPage++;
        }
    };

    $scope.nextPageDisabled = function () {
        return $scope.currentPage === $scope.pageCount() - 1 ? "disabled" : "";
    };
});

app.filter('transportMode', function () {
    return function (images, travelMode) {
        if (images.length > 0) {
            return images.filter(function (image) {
                console.log(image);
                if (image.otherMode === "driving" && travelMode.driving) {
                    return true;
                } else if (image.otherMode === "walking" && travelMode.walking) {
                    return true;
                }
            })
        } else {
            return images;
        }
    };
});

app.filter('offset', function () {
    return function (input, start) {
        start = parseInt(start, 10);
        return input.slice(start);
    };
});