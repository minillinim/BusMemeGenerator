var app = angular.module('bus-meme', ['ngRoute']);

app.config(function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'views/main.html',
        controller: 'MapController'
    })
});

app.controller('MapController', function ($scope, MapService, $anchorScroll) {
    var transitDirections;
    var drivingOrWalkingDirections;
    var map;
    
    $scope.transport = {
        mode: 'driving'
    };

    $scope.getMapData = function () {
        if (validateAddresses()) {
            $scope.showMap = true;

            initMap();

            var travelOptions = {
                startLat: document.getElementById('startAddressLat').value,
                startLng: document.getElementById('startAddressLong').value,
                destLat: document.getElementById('destAddressLat').value,
                destLng: document.getElementById('destAddressLong').value
            };

            MapService.getDirections(travelOptions, 'public', function (result, status) {
                $scope.$apply(function () {
                    $scope.public = {
                        distance: result.routes[0].legs[0].distance.text,
                        duration: result.routes[0].legs[0].duration.text
                    };
                });
                document.getElementById('public-duration').innerText = $scope.public.duration;

                if (status == google.maps.DirectionsStatus.OK) {
                    transitDirections.setDirections(result);
                }
            });

            MapService.getDirections(travelOptions, $scope.transport.mode, function (result, status) {
                $scope.$apply(function () {
                    $scope.other = {
                        distance: result.routes[0].legs[0].distance.text,
                        duration: result.routes[0].legs[0].duration.text
                    };
                });

                document.getElementById('other-duration').innerText = $scope.other.duration;
                if (status == google.maps.DirectionsStatus.OK) {
                    drivingOrWalkingDirections.setDirections(result);
                }
            });

            initStep2();
        } else {
            document.getElementById('map-results').className = "";
            document.getElementById('journey-details').className = "";
        }
    };

    function initStep2() {
        document.getElementById('map-results').className = 'showmap';
        document.getElementById('journey-details').className = 'done';
        $anchorScroll('map-results');
        document.getElementById('summary-from').innerText = document.getElementById('start-address').value;
        document.getElementById('summary-to').innerText = document.getElementById('dest-address').value;
    
        
    }

    var initMap = function () {
        var logan = new google.maps.LatLng(-27.6410476, 153.10750899999994);
        var mapOptions = {
            zoom: 11,
            center: logan,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById("gmap_canvas"), mapOptions);

        transitDirections = new google.maps.DirectionsRenderer({
            map: map,
            polylineOptions: {strokeColor: 'red'}
        });
        drivingOrWalkingDirections = new google.maps.DirectionsRenderer({
            map: map,
            polylineOptions: {strokeColor: 'blue'}
        });
    }
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

