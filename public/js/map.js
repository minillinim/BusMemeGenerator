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

app.controller('MapController', function ($scope, $location, $rootScope, MapService, $anchorScroll) {
    
    $rootScope.showGallery = function () {
        $location.path('/galleries');
    };

    loadGoogleAutocomplete();

    $scope.transport = {
        mode: 'driving'
    };

    $scope.showImage = false;
    $scope.showMap = false;
    
    $scope.origin = '';
    $scope.destination = '';
    
    $scope.ptLatLng = [];
    $scope.dwLatLng = [];

    $scope.dwBounds = null;
    $scope.ptBounds = null;
    
    $scope.map = null;

    var bothResultsFound = function () {
        return ($scope.dwBounds) && ($scope.ptBounds);
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

        $scope.dwBounds = null;
        $scope.ptBounds = null;

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

                        $scope.dwLatLng = dwRoute.polylineCoords;
                        document.getElementById('other-duration').innerText = dwRoute.duration;
                        $scope.dwBounds = dwRoute.bounds;
                        console.log(dwRoute.bounds);

                        return true;
                    }
                    return false;
                }
            ).then(
                function(dwWorked) {
                    if(!dwWorked) { return false; }

                    var tlapiUrl = window.location.href.replace(
                        "#",
                        "tl/"+
                        startLat+"/"+
                        startLng+"/"+
                        destLat+"/"+
                        destLng+"/"+
                        $scope.getTimeOption()+"/"+
                        $scope.getSelectedTime().getTime()/1000+"/"
                        +$scope.getMaxWalk()
                    );

                    return $.ajax({
                        type: "GET",
                        url: tlapiUrl,
                        async: false,
                        success: function (journey) {
                            if(!journey) { return false; }

                            $scope.public = {
                                mode: 'public',
                                distance: journey.walkingDistance,
                                duration: journey.duration
                            };

                            $scope.ptLatLng = [];
                            journey.legs.forEach(function(leg) {
                                google.maps.geometry.encoding.decodePath(leg.polyline).forEach(function(ll) {
                                    $scope.ptLatLng.push( {"lat": ll.lat(), "lng": ll.lng()} );    
                                });
                            });

                            document.getElementById('public-duration').innerText = journey.duration;

                            $scope.ptBounds = findPolylineBounds($scope.ptLatLng);

                            return true;
                        },
                        error: function (err) {
                            return false;
                        }
                    });
                }
            ).then(
                function(bothWorked) {
                    if(bothWorked) {
                        $scope.$apply(function () {
                            console.log($scope.ptLatLng)
                            console.log($scope.dwLatLng)
                            $scope.mapToImage();
                        });
                    }
                }
            );

            initStep2();
            scrollToElement('invisible-anchor');
            $scope.showMap = true;

        } else {
            $scope.showMap = false;
        }
    };

    var findPolylineBounds = function(polyline) {
        var latMax = polyline[0].lat,
            lngMax = polyline[0].lng,
            latMin = polyline[0].lat,
            lngMin = polyline[0].lng;

        for(var i=1; i< polyline.length; i++) {
            if (polyline[i].lat > latMax) { latMax = polyline[i].lat; }
            if (polyline[i].lat < latMin) { latMin = polyline[i].lat; }
            if (polyline[i].lng > lngMax) { lngMax = polyline[i].lng; }
            if (polyline[i].lng < lngMin) { lngMin = polyline[i].lng; }
        }
        console.log("IFB:", latMax, latMin, lngMax, lngMin);

        var bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(latMax, lngMax),
            new google.maps.LatLng(latMin, lngMin)
        );
        console.log(bounds);
        return bounds;
    }

    var shorter = function(duration){
        return duration.toLowerCase().replace('hour', 'hr');
    }

    var renderStaticMap = function () {
        
        var gmapsInfo = getMapConversionInfo();

        $('#img-out').show();

        var staticMapsUrl = 'https://maps.googleapis.com/maps/api/staticmap?scale=1&',
            startMarker = 'markers=color:0x80da40ff|label:A|' + $scope.origin,
            endMarker = 'markers=color:0xf76255ff|label:B|' + $scope.destination,
            mapCenter = 'center=' + $scope.center.lat() + ',' + $scope.center.lng(),
            zoomLevel = +'zoom=' + $scope.zoom,
            mapSize = 'size=' + $scope.mapWidth + 'x' + $scope.mapWidth,
            commonUrl = staticMapsUrl + mapCenter + '&' + zoomLevel + '&' + mapSize + '&' + startMarker + '&' + endMarker;

        var image = document.getElementById('img-out');
        image.setAttribute('crossorigin', 'anonymous');
        image.setAttribute('src', commonUrl);

        $("#img-out").load(function() {
            
            var canvas = document.getElementById("canvas");
            var context = canvas.getContext("2d");
            $rootScope.context = context;
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0, canvas.width, canvas.height);

            var lineWidth = 4;

            drawPolyline($scope.ptLatLng, context, lineWidth, "#FF0000", gmapsInfo);
            drawPolyline($scope.dwLatLng, context, lineWidth, "#0000FF", gmapsInfo);
            
            $('#img-out').hide(); 

            $('#gmap-canvas').remove();
            $('#map-wrapper').append($('<div>', {'id': 'gmap-canvas', 'class': 'gmap-canvas'}));
            $('#map-wrapper').hide();
        });
    }

    $scope.mapToImage = function () {

        if (bothResultsFound()) {
            
            $scope.mapWidth = 600;
            $scope.bounds = getCombinedBounds([$scope.ptBounds, $scope.dwBounds]),
            $scope.center = $scope.bounds.getCenter(),
            $scope.zoom = getZoom($scope.bounds, $scope.mapWidth);

            console.log($scope.bounds)

            var mapOptions = {
                zoom: $scope.zoom,
                center: $scope.center,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            $('#map-wrapper').show();
            $scope.map = new google.maps.Map(document.getElementById("gmap-canvas"), mapOptions);

            google.maps.event.addListenerOnce($scope.map, 'idle', function() {
                if($scope.map.getZoom() != $scope.zoom) {
                    google.maps.event.addListenerOnce($scope.map, "zoom_changed", function() {
                        renderStaticMap();
                    });
                    $scope.map.setZoom($scope.zoom);
                } else {
                    renderStaticMap();
                }
            });
        }
    };

    var writeTextOnImage = function (context, text, x, y) {

        var f = 36;
        for (; f >= 0; f -= 1) {
            context.font = "bold " + f + "pt Impact, Charcoal, sans-serif";
            if (context.measureText(text).width < canvas.width - 10) {
                context.textAlign = "center";
                context.fillStyle = "white";
                context.strokeStyle = "black";
                context.lineWidth = 4;
                context.fillText(text, x, y);
                context.strokeText(text, x, y);

                break;
            }
        }
    }

    var drawPolyline = function(latLngArray, context, lineWidth, lineColor, gmapsInfo) {    

        var startCoords = getXYcoords(gmapsInfo, new google.maps.LatLng(latLngArray[0].lat, latLngArray[0].lng));
        context.strokeStyle = lineColor;
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(startCoords[0], startCoords[1]);

        for(i=1; i<latLngArray.length; i++) {
            var coord = getXYcoords(gmapsInfo, new google.maps.LatLng(latLngArray[i].lat, latLngArray[i].lng));
            context.lineTo(coord[0], coord[1]);
        }
        context.lineWidth = lineWidth;
        context.stroke();
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
        $rootScope.memeText = $rootScope.selectedTemplate.firstLine + ' - ' + $rootScope.selectedTemplate.secondLine;

    };

    var getZoom = function (bounds, mapWidth) {
        //https://stackoverflow.com/a/13274361
        var WORLD_DIM = { height: 256, width: 256 };
        var ZOOM_MAX = 21;

        function _latRad(lat) {
            var sin = Math.sin(lat * Math.PI / 180);
            var radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
            return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
        }

        function _zoom(mapPx, worldPx, fraction) {
            return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
        }

        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();

        var latFraction = (_latRad(ne.lat()) - _latRad(sw.lat())) / Math.PI;

        var lngDiff = ne.lng() - sw.lng();
        var lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

        var latZoom = _zoom(mapWidth, WORLD_DIM.height, latFraction);
        var lngZoom = _zoom(mapWidth, WORLD_DIM.width, lngFraction);

        return Math.min(latZoom, lngZoom, ZOOM_MAX);
    };

    var getCombinedBounds = function (bounds) {
        var bBounds = bounds[0];
        for(var i=1; i< bounds.length; i++) {
            bBounds.extend(bounds[i].getNorthEast());
            bBounds.extend(bounds[i].getSouthWest());
        }
        return bBounds;
    };

    var getMapConversionInfo = function () {

        var projection = $scope.map.getProjection();

        var bounds = $scope.map.getBounds();
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

    var getXYcoords = function (mapInfo, latLng) {

        var worldPoint = mapInfo.projection.fromLatLngToPoint(latLng);
        return [
                (worldPoint.x - mapInfo.origin.x) * mapInfo.xScale,
                (worldPoint.y - mapInfo.origin.y) * mapInfo.yScale
               ];
    }

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

    var initStep2 = function () {

        document.getElementById('step-1').classList.add('done');
        document.getElementById('summary-from').innerText = document.getElementById('start-address').value;
        document.getElementById('summary-to').innerText = document.getElementById('dest-address').value;
    }
    
    var scrollToElement = function (id) {

        setTimeout(function () {
                $anchorScroll(id);
        }, 10);
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