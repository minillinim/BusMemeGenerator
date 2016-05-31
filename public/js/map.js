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

    $scope.showMap = false;
    $scope.transitDirectionsPolyline = '';
    $scope.drivingOrWalkingDirectionsPolyline = '';
    $scope.origin='';
    $scope.destination='';
    $scope.showImage = false;

    $scope.getMapData = function () {
        if (validateAddresses()) {
            $scope.showMap = true;

            initMap();
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
            $scope.destination =  destLat + ',' + destLng;

            MapService.getDirections(travelOptions, 'public', function (result, status) {
                $scope.$apply(function () {
                    $scope.public = {
                        distance: result.routes[0].legs[0].distance.text,
                        duration: result.routes[0].legs[0].duration.text
                    };
                });
                document.getElementById('public-duration').innerText = $scope.public.duration;

                if (status == google.maps.DirectionsStatus.OK) {
                    $scope.transitDirectionsPolyline = result.routes[0].overview_polyline;
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
                    $scope.drivingOrWalkingDirectionsPolyline = result.routes[0].overview_polyline;
                    drivingOrWalkingDirections.setDirections(result);
                }
            });

            initStep2();
        } else {
            document.getElementById('map-results').className = "";
            document.getElementById('journey-details').className = "";
        }
    };
    $scope.exportAsImage = function() {
        var staticMapsUrl = 'https://maps.googleapis.com/maps/api/staticmap?';
        var startMarker = 'markers=color:0x80da40ff|label:A|' + $scope.origin;
        var endMarker = 'markers=color:0xf76255ff|label:B|' + $scope.destination;
        var transitPath = 'path=color:0xff0000ff|weight:4|enc:' + $scope.transitDirectionsPolyline;
        var drivingOrWalkingPath = 'path=color:0x0000ffff|weight:4|enc:' + $scope.drivingOrWalkingDirectionsPolyline;
        staticMapsUrl += '&' + transitPath + '&' + drivingOrWalkingPath + '&size=600x600' + '&' + startMarker + '&' + endMarker;
        document.getElementById('img-out').setAttribute('src', staticMapsUrl);
        $scope.showImage = true;
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

