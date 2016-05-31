var app = angular.module('bus-meme', ['ngRoute']);

app.config(function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'views/main.html',
        controller: 'MapController'
    })
});

app.controller('MapController', function ($scope, MapService, $anchorScroll) {
    var map;

    $scope.transport = {
        mode: 'driving'
    };

    $scope.showMap = false;
    $scope.transitDirectionsPolyline = '';
    $scope.drivingOrWalkingDirectionsPolyline = '';
    $scope.origin = '';
    $scope.destination = '';

    var bothResultsFound = function () {
        return ($scope.transitDirectionsPolyline !== '') && ($scope.drivingOrWalkingDirectionsPolyline !== '');
    };

    $scope.getMapData = function () {
        if (validateAddresses()) {
            $scope.showMap = true;

            var startLat = document.getElementById('startAddressLat').value,
                startLng = document.getElementById('startAddressLong').value,
                destLat = document.getElementById('destAddressLat').value,
                destLng = document.getElementById('destAddressLong').value;

            var travelOptions = {
                startLat: startLat,
                startLng: startLng,
                destLat: destLat,
                destLng: destLng
            };

            $scope.origin = startLat + ',' + startLng;
            $scope.destination = destLat + ',' + destLng;

            MapService.getDirections(travelOptions, 'public', function (result, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    $scope.$apply(function () {
                        $scope.public = {
                            distance: result.routes[0].legs[0].distance.text,
                            duration: result.routes[0].legs[0].duration.text
                        };
                    });
                    document.getElementById('public-duration').innerText = $scope.public.duration;
                    $scope.transitDirectionsPolyline = result.routes[0].overview_polyline;
                    $scope.transitBounds = result.routes[0].bounds;
                    $scope.exportAsImage();
                }
            });

            MapService.getDirections(travelOptions, $scope.transport.mode, function (result, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    $scope.$apply(function () {
                        $scope.other = {
                            distance: result.routes[0].legs[0].distance.text,
                            duration: result.routes[0].legs[0].duration.text
                        };
                    });
                    document.getElementById('other-duration').innerText = $scope.other.duration;
                    $scope.drivingOrWalkingDirectionsPolyline = result.routes[0].overview_polyline;
                    $scope.drivingOrWalkingBounds = result.routes[0].bounds;
                    $scope.exportAsImage();
                }
            });

            initStep2();
        }
    };

    var getZoom = function (bounds, mapWidth) {
        //http://stackoverflow.com/a/6055653
        var GLOBE_WIDTH = 256; // a constant in Google's map projection
        var west = bounds.getSouthWest().lng();
        var east = bounds.getNorthEast().lng();
        var angle = east - west;
        if (angle < 0) {
            angle += 360;
        }
        return Math.round(Math.log(mapWidth * 360 / angle / GLOBE_WIDTH) / Math.LN2) - 1;
    };

    $scope.exportAsImage = function () {
        var mapWidth = 600;
        if (bothResultsFound()) {
            var bounds = getBoundsCoveringBoth($scope.transitBounds, $scope.drivingOrWalkingBounds),
                center = bounds.getCenter(),
                zoom = getZoom(bounds, mapWidth),
                staticMapsUrl = 'https://maps.googleapis.com/maps/api/staticmap?scale=1&',
                startMarker = 'markers=color:0x80da40ff|label:A|' + $scope.origin,
                endMarker = 'markers=color:0xf76255ff|label:B|' + $scope.destination,
                mapCenter = 'center=' + center.lat() + ',' + center.lng(),
                zoomLevel = +'zoom=' + zoom,
                mapSize = 'size=' + mapWidth + 'x' + mapWidth,
                transitPath = 'path=color:0xff0000ff|weight:4|enc:' + $scope.transitDirectionsPolyline,
                drivingOrWalkingPath = 'path=color:0x0000ffff|weight:4|enc:' + $scope.drivingOrWalkingDirectionsPolyline,
                commonUrl = staticMapsUrl + mapCenter + '&' + zoomLevel + '&' + mapSize + '&' + startMarker + '&' + endMarker;

            $('#img-out').show();
            var image1 = document.getElementById('img-out');
            image1.setAttribute('crossorigin', 'anonymous');
            image1.setAttribute('src', commonUrl + '&' + drivingOrWalkingPath);
            document.getElementById('img-out-2').setAttribute('src', commonUrl + '&' + transitPath);

        }
    };

    function initStep2() {
        document.getElementById('journey-details').className = 'done';
        $anchorScroll('map-results');
        document.getElementById('summary-from').innerText = document.getElementById('start-address').value;
        document.getElementById('summary-to').innerText = document.getElementById('dest-address').value;
    }

    var getBoundsCoveringBoth = function (bounds1, bounds2) {
        bounds1.extend(bounds2.getNorthEast());
        bounds1.extend(bounds2.getSouthWest());
        return bounds1;
    };
});

app.factory('MapService', function () {
    return {
        getDirections: function (travelOptions, mode, callback) {
            var directionsService = new google.maps.DirectionsService();

            var start = new google.maps.LatLng(travelOptions.startLat, travelOptions.startLng);
            var end = new google.maps.LatLng(travelOptions.destLat, travelOptions.destLng);
            var request = {
                origin: start,
                destination: end
            };

            switch (mode) {
                case 'driving':
                    request.travelMode = google.maps.TravelMode.DRIVING;
                    break;
                case 'walking':
                    request.travelMode = google.maps.TravelMode.WALKING;
                    break;
                default:
                    request.travelMode = google.maps.TravelMode.TRANSIT;
            }
            directionsService.route(request, callback);
        }
    };
});