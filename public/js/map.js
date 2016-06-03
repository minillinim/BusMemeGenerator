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
    var projectedWidth = topRight.x - bottomLeft.x;
    var projectedHeight = bottomLeft.y - topRight.y;

    var container = document.getElementById('gmap-canvas');
    var xScale = parseInt(container.offsetWidth) / projectedWidth;
    var yScale = parseInt(container.offsetHeight) / projectedHeight;

    return {"xScale": xScale, "yScale": yScale, "origin": topLeft, "projection": projection, "width": container.offsetWidth};
}

function getXYcoords(mapInfo, latLng) {
    var worldPoint = mapInfo.projection.fromLatLngToPoint(latLng);
    return [
            (worldPoint.x - mapInfo.origin.x) * mapInfo.xScale,
            (worldPoint.y - mapInfo.origin.y) * mapInfo.yScale
           ];
}
    
function drawPolyline(map, latlng, context, lineColor, gmapsInfo) {      
    var startCoords = getXYcoords(gmapsInfo, new google.maps.LatLng(latlng[0].lat, latlng[0].lng));
    context.strokeStyle = lineColor;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(startCoords[0], startCoords[1]);
    for(i=1; i<latlng.length; i++) {
        var coord = getXYcoords(gmapsInfo, new google.maps.LatLng(latlng[i].lat, latlng[i].lng));
        context.lineTo(coord[0], coord[1]);
    }
    context.stroke();
}

app.controller('MapController', function ($scope, $location,$rootScope,MapService, $anchorScroll) {
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
        return ($scope.drivingOrWalkingBounds) && ($scope.transitBounds);
    };

    var getGoogleRoute = function(mode, startLat, startLng, endLat, endLng) {
        var d = Q.defer();

        var travelOptions = {
            startLat: startLat,
            startLng: startLng,
            destLat: endLat,
            destLng: endLng
        };

        var routeDetails = {};
        MapService.getDirections(travelOptions, mode, function (result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                routeDetails['distance'] = result.routes[0].legs[0].distance.text;
                routeDetails['duration'] = result.routes[0].legs[0].duration.text;

                var latLng = []
                result.routes.forEach(function(route) {
                    route.legs.forEach(function(leg) {
                        leg.steps.forEach(function(step) {
                            step.path.forEach(function(path) {
                                latLng.push({lat: path.lat(), lng: path.lng() });
                            });
                        });
                    });       
                });

                routeDetails['polyline'] = result.routes[0].overview_polyline;
                routeDetails['polylineCoords'] = latLng;
                routeDetails['bounds'] = result.routes[0].bounds;
                
                d.resolve(routeDetails);
            } else {
                d.resolve(null);
            }
        });

        return d.promise;
    }

    $scope.getMapData = function () {
        
        $scope.drivingOrWalkingBounds = null;
        $scope.transitBounds = null;
        if (validateAddresses()) {
            var startLat = document.getElementById('startAddressLat').value,
                startLng = document.getElementById('startAddressLong').value,
                destLat = document.getElementById('destAddressLat').value,
                destLng = document.getElementById('destAddressLong').value;

            $scope.origin = startLat + ',' + startLng;
            $scope.destination = destLat + ',' + destLng;

            getGoogleRoute($scope.transport.mode, startLat, startLng, destLat, destLng).then(
                function(dwRoute) {
                    if(dwRoute) {
                        $scope.$apply(function () {
                            $scope.other = {
                                mode: $scope.transport.mode,
                                distance: dwRoute.distance,
                                duration: dwRoute.duration
                            };
                        });
                        latlngWalking = dwRoute.polylineCoords;
                        document.getElementById('other-duration').innerText = shorter(dwRoute.duration);
                        $scope.drivingOrWalkingBounds = dwRoute.bounds;
                        return true;
                    }
                    return false;
                }
            ).then(
                function(lastWorked) {
                    if(!lastWorked) { return false; }
                    getGoogleRoute('public', startLat, startLng, destLat, destLng).then(
                        function(ptRoute) {
                            if(ptRoute) {
                                $scope.$apply(function () {
                                    $scope.public = {
                                        mode: 'public',
                                        distance: ptRoute.distance,
                                        duration: ptRoute.duration
                                    };
                                });
                                latlngPublic = ptRoute.polylineCoords;
                                $scope.transitDirectionsPolyline = ptRoute.polyline;
                                document.getElementById('public-duration').innerText = shorter(ptRoute.duration);
                                $scope.transitBounds = ptRoute.bounds;
                                return true;
                            }
                            return false;
                        }
                    ).then(
                        function(bothWorked) {
                            if(bothWorked) {
                                $scope.$apply(function () {
                                    $scope.mapToImage();
                                });
                            }
                        }
                    );
                }
            );

            initStep2();
            scrollToElement('invisible-anchor');
            $scope.showMap = true;

        } else {
            $scope.showMap = false;
        }
    };

    var shorter = function(duration){
        return duration.toLowerCase().replace('hour', 'hr');
    }

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

    var fitBoundsThenRender = function (_map, bounds) {
        // https://stackoverflow.com/questions/9843732/how-to-affect-the-grace-margin-of-map-fitbounds
        var zoom = 0;
        _map.fitBounds(bounds);

        var overlayHelper = new google.maps.OverlayView();
        overlayHelper.draw = function () {
            if (!this.ready) {
                var projection = this.getProjection(),
                zoom = getExtraZoom(projection, bounds, _map.getBounds());
                if (zoom > 0) {
                    google.maps.event.addListenerOnce(_map, "zoom_changed", function() {
                        // don't do anything until the zoom is changed
                        renderStaticMap();
                    });
                    _map.setZoom(_map.getZoom() + zoom);
                } else {
                    renderStaticMap();
                }
                this.ready = true;
                google.maps.event.trigger(this, 'ready');
            }
        };
        overlayHelper.setMap(_map);
    }

    // LatLngBounds b1, b2 -> zoom increment
    var getExtraZoom = function (projection, expectedBounds, actualBounds) {
        var expectedSize = getSizeInPixels(projection, expectedBounds),
            actualSize = getSizeInPixels(projection, actualBounds);

        if (Math.floor(expectedSize.x) == 0 || Math.floor(expectedSize.y) == 0) {
            return 0;
        }

        var qx = actualSize.x / expectedSize.x;
        var qy = actualSize.y / expectedSize.y;
        var min = Math.min(qx, qy);

        if (min < 1) {
            return 0;
        }

        return Math.floor(Math.log(min) / Math.log(2) /* = log2(min) */);
    }

    // LatLngBounds bnds -> height and width as a Point
    var getSizeInPixels = function (projection, bounds) {
        var sw = projection.fromLatLngToContainerPixel(bounds.getSouthWest());
        var ne = projection.fromLatLngToContainerPixel(bounds.getNorthEast());
        return new google.maps.Point(Math.abs(sw.y - ne.y), Math.abs(sw.x - ne.x));
    }

    var renderStaticMap = function () {
        var gmapsInfo = getMapConversionInfo(map);

        $('#img-out').show();

        var staticMapsUrl = 'https://maps.googleapis.com/maps/api/staticmap?scale=1&',
            startMarker = 'markers=color:0x80da40ff|label:A|' + $scope.origin,
            endMarker = 'markers=color:0xf76255ff|label:B|' + $scope.destination,
            mapCenter = 'center=' + $scope.center.lat() + ',' + $scope.center.lng(),
            zoomLevel = +'zoom=' + $scope.zoom,
            mapSize = 'size=' + $scope.mapWidth + 'x' + $scope.mapWidth,
            transitPath = 'path=color:0x00ff0000|weight:4|enc:' + $scope.transitDirectionsPolyline,
            commonUrl = staticMapsUrl + mapCenter + '&' + zoomLevel + '&' + mapSize + '&' + startMarker + '&' + endMarker;

        var image = document.getElementById('img-out');
        image.setAttribute('crossorigin', 'anonymous');
        image.setAttribute('src', commonUrl + '&' + '&' + transitPath);
        
        $("#img-out").load(function() {
            
            var canvas = document.getElementById("canvas");
            var context = canvas.getContext("2d");
            $rootScope.context = context;
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            context.imageSmoothingEnabled = true;
            context.textAlign = "center";
            context.fillStyle = "white";
            context.strokeStyle = "black";
            context.lineWidth = 4;
            
            drawPolyline(map, latlngPublic, context, "#FF0000", gmapsInfo);
            drawPolyline(map, latlngWalking, context, "#0000FF", gmapsInfo);
            
            $('#img-out').hide(); 

            $('#gmap-canvas').remove();
            $('#map-wrapper').append($('<div>', {'id': 'gmap-canvas', 'class': 'gmap-canvas'}));
            $('#map-wrapper').hide();
        });
    }

    $scope.mapToImage = function () {

        if (bothResultsFound()) {
            $scope.mapWidth = 600;

            $scope.bounds = getBoundsCoveringBoth($scope.transitBounds, $scope.drivingOrWalkingBounds),
            $scope.center = $scope.bounds.getCenter(),
            $scope.zoom = getZoom($scope.bounds, $scope.mapWidth);

            var mapOptions = {
                zoom: $scope.zoom,
                center: $scope.center,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            $('#map-wrapper').show();
            map = new google.maps.Map(document.getElementById("gmap-canvas"), mapOptions);

            google.maps.event.addListenerOnce(map, "projection_changed", function() {
                fitBoundsThenRender(map, $scope.bounds);
            });
        }
    };

    var writeTextOnImage = function (context, text, x, y) {
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

    $scope.renderMemeFinal = function () {
        var context = $rootScope.context;
        var image = document.getElementById('img-out');

        var topText = $rootScope.selectedTemplate.firstLine;
        var bottomText = $rootScope.selectedTemplate.secondLine;

        var width = image.width;
        var height = image.height;
        context.textAlign = "center";
        context.fillStyle = "white";
        context.strokeStyle = "black";
        context.lineWidth = 2;
        writeTextOnImage(context, topText, width / 2, 70);
        writeTextOnImage(context, bottomText, width / 2, height - 30);

        $('canvas2').remove();
        
    };

    $scope.shareImage = function() {
        
        document.getElementById("meme-validation").innerText = '';

        if ($rootScope.selectedTemplate){
            document.getElementById('map-results').classList.add('done');
            $scope.renderMemeFinal();
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