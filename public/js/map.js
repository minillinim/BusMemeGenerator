var app = angular.module('bus-meme', ['ngRoute']);

app.config(function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'views/main.html',
        controller: 'MapController'
    }).when('/galleries', {
        templateUrl: 'views/gallery.html',
        controller: 'GalleryController'
    })
});

function getMapConversionInfo(_map) {
    var projection = _map.getProjection();

    var bounds = _map.getBounds();
    var topRight = projection.fromLatLngToPoint(bounds.getNorthEast());
    var bottomLeft = projection.fromLatLngToPoint(bounds.getSouthWest());

    var topLeft = new google.maps.Point(bottomLeft.x, topRight.y);
    var width_pr = topRight.x - bottomLeft.x;
    var height_pr = bottomLeft.y - topRight.y;

    var container = document.getElementById('gmap_canvas');
    var x_scale = parseInt(container.offsetWidth) / width_pr;
    var y_scale = parseInt(container.offsetHeight) / height_pr;

    return {"xScale": x_scale, "yScale": y_scale, "origin": topLeft, "projection": projection};
}

function getXYcoords(mapInfo, latLng) {
    var worldPoint = mapInfo.projection.fromLatLngToPoint(latLng);
    return [(worldPoint.x - mapInfo.origin.x) * mapInfo.xScale, (worldPoint.y - mapInfo.origin.y) * mapInfo.yScale]
}
    
function drawPolyline(map, latlng, context, lineColor, mapConversionInfo) {  
    
    //google.maps.event.addListenerOnce(map,"projection_changed", function() {
        var startCoords = getXYcoords(mapConversionInfo, new google.maps.LatLng(latlng[0].lat, latlng[0].lng));
        context.strokeStyle = lineColor;
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(startCoords[0], startCoords[1]);
        for(i=1; i<latlng.length; i++) {
            var coord = getXYcoords(mapConversionInfo, new google.maps.LatLng(latlng[i].lat, latlng[i].lng));
    
                console.log(latlng[i].lat, latlng[i].lng, coord);
            context.lineTo(coord[0], coord[1]);
        }
        context.stroke();
    //});
}

app.controller('MapController', function ($scope, $location,$rootScope,MapService, $anchorScroll) {
    var transitDirections;
    var map;
    var latlngPublic;
    var latlngWalking;

    $rootScope.showGallery = function () {
        $location.path('/galleries');
    };

    loadGoogleAutocomplete();

    $scope.transport = {
        mode: 'driving'
    };

    $scope.showImage = false;
    $scope.showMap = false;
    $scope.transitDirectionsPolyline = '';
    $scope.drivingOrWalkingDirectionsPolyline = '';
    $scope.origin = '';
    $scope.destination = '';

    var bothResultsFound = function () {
        return ($scope.transitDirectionsPolyline !== '') && ($scope.drivingOrWalkingDirectionsPolyline !== '');
    };

   var initMap = function (zoom, center) {

        var mapOptions = {
            zoom: zoom,
            center: center,
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
    };
 
    $scope.getMapData = function () {
        
        if (validateAddresses()) {
            if (document.getElementById('map-results')) document.getElementById('map-results').style.display = 'block';
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
                            mode: 'public',
                            distance: result.routes[0].legs[0].distance.text,
                            duration: result.routes[0].legs[0].duration.text
                        };
                    });
                    
                    latlngPublic = [];
                    
                    result.routes.forEach(function(route) {
                        route.legs.forEach(function(leg) {
                            leg.steps.forEach(function(step) {
                                step.path.forEach(function(path) {
                                    latlngPublic.push({lat: path.lat(), lng: path.lng() });
                                });
                            });
                        });       
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
                            mode: $scope.transport.mode,
                            distance: result.routes[0].legs[0].distance.text,
                            duration: result.routes[0].legs[0].duration.text
                        };
                    });
                    latlngWalking = [];
                    
                    result.routes.forEach(function(route) {
                        route.legs.forEach(function(leg) {
                            leg.steps.forEach(function(step) {
                                step.path.forEach(function(path) {
                                    latlngWalking.push({lat: path.lat(), lng: path.lng() });
                                });
                            });
                        });       
                    });
                    document.getElementById('other-duration').innerText = $scope.other.duration;
                    $scope.drivingOrWalkingDirectionsPolyline = result.routes[0].overview_polyline;
                    $scope.drivingOrWalkingBounds = result.routes[0].bounds;
                    $scope.exportAsImage();
                }
            });
            initStep2();
            //scrollToElement('invisible-anchor');
            //isAddressChanged = false;                                                  

        } else {
            document.getElementById('map-results').className = "";
            document.getElementById('journey-details').className = "";
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

            initMap(zoom, center);

            $('#img-out').show();
            var image = document.getElementById('img-out');
            image.setAttribute('crossorigin', 'anonymous');
            image.setAttribute('src', commonUrl);
            $("#img-out").load(function(){
                var canvas = document.getElementById("canvas");
                var context = canvas.getContext("2d");
                $rootScope.context = context;
                canvas.width = image.width;
                canvas.height = image.height;
                context.drawImage(image, 0, 0, canvas.width, canvas.height);
                context.textAlign = "center";
                context.fillStyle = "white";
                context.strokeStyle = "black";
                context.lineWidth = 2;

                var mapConversionInfo = getMapConversionInfo(map);
                    // google.maps.event.addListenerOnce(map,"projection_changed", function() {
                    drawPolyline(map, latlngPublic, context, "#FF0000", mapConversionInfo);
                    drawPolyline(map, latlngWalking, context, "#00FF00", mapConversionInfo);
                    // });

                    $('#img-out').hide();            
                });
        }
    };

    $scope.shareImage = function() {
        
        document.getElementById("meme-validation").innerText = '';

        if ($rootScope.selectedTemplate){
            document.getElementById('map-results').classList.add('done');
            $scope.showImage = true;

            scrollToElement('invisible-map-anchor');
        }
        else{
            document.getElementById("meme-validation").innerText = 'Select a meme template on the right hand side to create your meme';
        }
    };

    function initStep2() {
        document.getElementById('step-1').classList.add('done');
        document.getElementById('summary-from').innerText = document.getElementById('start-address').value;
        document.getElementById('summary-to').innerText = document.getElementById('dest-address').value;
    }
    
    function scrollToElement(id) {
        setTimeout(function () {
                $anchorScroll(id);
        }, 10);
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