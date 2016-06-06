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
    
    $scope.origin = null;
    $scope.destination = null;
    
    $scope.ptLatLng = [];
    $scope.dwLatLng = [];

    $scope.dwBounds = null;
    $scope.ptBounds = null;
    
    $scope.map = null;

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
                var currentMode = "";
                routeDetails['polylineCoords'] = []
                result.routes.forEach(function(route) {
                    route.legs.forEach(function(leg) {
                        leg.steps.forEach(function(step) {
                            var travelMode = step.travel_mode.toLowerCase(); 
                            if(travelMode !== currentMode) {
                                if(latLng.length > 0) {
                                    routeDetails['polylineCoords'].push( {"mode": currentMode, "coords": latLng} )
                                    latLng = [];
                                }
                                currentMode = travelMode;
                            }
                            step.path.forEach(function(path) {
                                latLng.push({lat: path.lat(), lng: path.lng() });
                            });
                        });
                    });       
                });
                if(latLng.length > 0) {
                    routeDetails['polylineCoords'].push( {"mode": currentMode, "coords": latLng} )
                    latLng = [];
                }
                routeDetails['bounds'] = result.routes[0].bounds;                
                d.resolve(routeDetails);
            } else {
                d.resolve(null);
            }
        });
        return d.promise;
    }

    var clearStatus = function() {
        $('#map-status').html('');
    }

    var addStatus = function(message) {
        $('#map-status').html($('#map-status').html() + "<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + message);
    }

    $scope.getMapData = function () {

        $scope.dwBounds = null;
        $scope.ptBounds = null;

        clearStatus()
        $('#map-status').show();
        addStatus('Building your meme, please be patient');
        $('#map-wrapper').show();

        $scope.public = {
            mode: 'public',
            distance: '',
            duration: ''
        };

        $scope.other = {
            mode: $scope.transport.mode,
            distance: '',
            duration: ''
        };

        if (validateAddresses()) {
            addStatus("Addresses are valid");
            var startLat = document.getElementById('startAddressLat').value,
                startLng = document.getElementById('startAddressLong').value,
                destLat = document.getElementById('destAddressLat').value,
                destLng = document.getElementById('destAddressLong').value;

            $scope.origin = new google.maps.LatLng(startLat, startLng);
            $scope.destination = new google.maps.LatLng(destLat, destLng);

            addStatus("Retrieving " + $scope.transport.mode + " directions from Google...");
            getGoogleRoute($scope.transport.mode, startLat, startLng, destLat, destLng).then(
                function(dwRoute) {
                    if(dwRoute) {
                        addStatus("Success!");
                        $scope.other = {
                            mode: $scope.transport.mode,
                            distance: dwRoute.distance,
                            duration: shorter(dwRoute.duration)
                        };
                        $scope.dwLatLng = dwRoute.polylineCoords;
                        $scope.dwBounds = dwRoute.bounds;
                        return [true, false];
                    }
                    addStatus("Failed to retrieve directions, please wait a moment and try again");
                    return [false, false];
                }
            ).then(
                function(dirStatus) {

                    var d = Q.defer();
                    if(!dirStatus[0]) { d.resolve(dirStatus); }

                    addStatus("Retrieving journey information from Translink (allowing 10 sec)...")

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

                    $.ajax({
                        type: "GET",
                        url: tlapiUrl,
                        timeout: 10000,
                        success: function (journey) {
                            if(!journey) {
                                addStatus("Failed to retrieve journey information");
                                d.resolve(dirStatus);
                            }
                            addStatus("Success!");
                            $scope.public = {
                                mode: 'public',
                                distance: prettyDistance(journey.walkingDistance),
                                duration: prettyDuration(journey.duration)
                            };

                            $scope.ptLatLng = [];
                            if(journey.legs){
                                journey.legs.forEach(function(leg) {
                                    var legLatLng = [];
                                    google.maps.geometry.encoding.decodePath(leg.polyline).forEach(function(ll) {
                                        legLatLng.push( {"lat": ll.lat(), "lng": ll.lng()} );    
                                    });
                                    $scope.ptLatLng.push( {"mode": leg.travelMode, "coords": legLatLng} );
                                });
                            }

                            $scope.ptBounds = findPolylineBounds($scope.ptLatLng);
                            d.resolve([true, true]);
                        },
                        error: function (err) {
                            addStatus("Journey could not be retrieved, trying Google...");
                            d.resolve(dirStatus);
                        }
                    });
                    return d.promise;
                }
            ).then(
                function(dirStatus) {
                    if(dirStatus[0]) {  // Google driving worked
                        if(dirStatus[1]) {  // Translink PT worked
                            $scope.$apply(function() {
                                $scope.mapToImage(true);
                            });
                        } else { // Translink PT failed
                            // Try google for PT route...
                            $scope.ptLatLng = [];
                            addStatus("Retrieving journey information from Google...");
                            return getGoogleRoute('transit', startLat, startLng, destLat, destLng).then(
                                function(ptRoute) {
                                    if(ptRoute) {
                                        addStatus("Success!");
                                        $scope.public = {
                                            mode: 'public',
                                            distance: "Walk: " + ptRoute.distance,
                                            duration: shorter(ptRoute.duration)
                                        };
                                        $scope.ptLatLng = ptRoute.polylineCoords;
                                        $scope.ptBounds = ptRoute.bounds;
                                        return true;
                                    }
                                    addStatus("Journey could not be retrieved, try walking there instead...");
                                    return false;
                                }
                            ).then(
                                function(googleFoundPT) {
                                    if(googleFoundPT) {
                                        return true;
                                    } else {
                                        // try walking...                                        
                                        if($scope.transport.mode === 'walking') {
                                            // we were already walking so...
                                            return false;
                                        } else {
                                            addStatus("Retrieving walking directions from Google...");
                                            return getGoogleRoute('walking', startLat, startLng, destLat, destLng).then(
                                                function(ptRoute) {
                                                    if(ptRoute) {
                                                        addStatus("Success!");
                                                        $scope.public = {
                                                            mode: 'public',
                                                            distance: "Walk: " + ptRoute.distance,
                                                            duration: shorter(ptRoute.duration)
                                                        };
                                                        $scope.ptLatLng = ptRoute.polylineCoords;
                                                        $scope.ptBounds = ptRoute.bounds;
                                                        return true;
                                                    }
                                                    addStatus("Failed to retrieve walking directions");
                                                    return false;
                                                }
                                            )
                                        }
                                    }
                                }
                            ).then(
                                function(ptRouteIsValid) {
                                    $scope.$apply(function() {
                                        $scope.mapToImage(ptRouteIsValid);
                                    });
                                }
                            );
                        } 
                    } else {
                        // everything failed
                        addStatus("Sorry, there was an error. PLease try again later");
                    }
                }
            );

            initStep2();
            scrollToElement('invisible-anchor');
            $scope.showMap = true;

        } else {
            addStatus("Invalid addresses");
            $scope.showMap = false;
        }
    };

    var renderStaticMap = function (ptRouteIsValid) {
        
        var gmapsInfo = getMapConversionInfo();

        var staticMapsUrl = 'https://maps.googleapis.com/maps/api/staticmap?',
            mapCenter = 'center=' + $scope.center.lat() + ',' + $scope.center.lng(),
            zoomLevel = 'zoom=' + $scope.zoom,
            mapSize = 'size=' + $scope.mapWidth + 'x' + $scope.mapWidth;

        var imgUrl = staticMapsUrl + mapCenter + '&' + zoomLevel + '&' + mapSize;
        console.log(imgUrl)

        var image = document.getElementById('img-out');
        image.setAttribute('crossorigin', 'anonymous');
        image.setAttribute('src', imgUrl);

        $('#img-out').show();
        $("#img-out").load(function() {
            
            var canvas = document.getElementById("canvas");
            var context = canvas.getContext("2d");
            $rootScope.context = context;
            canvas.width = image.width;
            canvas.height = image.height * 1.25;
            context.drawImage(image, 0, 0, canvas.width, image.height);

            var lineWidth = 2;

            drawCircleAt($scope.origin, context, '#006400', gmapsInfo)
            drawCircleAt($scope.destination, context, '#FF0000', gmapsInfo)

            if(ptRouteIsValid) {
                drawPolylines($scope.ptLatLng, context, lineWidth, '#FF0000', gmapsInfo);
            }
            drawPolylines($scope.dwLatLng, context, lineWidth, '#0000FF', gmapsInfo);

            drawLegend(context, gmapsInfo, image.height, canvas.width, canvas.height - image.height, image.height);

            $('#gmap-canvas').html("");
            $('#map-status').hide();
            $('#img-out').hide(); 
            $('#map-wrapper').hide();
        });
    }

    $scope.mapToImage = function (ptRouteIsValid) {
        addStatus("Rendering your meme...");
        $scope.mapWidth = 600;
        if(ptRouteIsValid) {
            $scope.bounds = getCombinedBounds([$scope.ptBounds, $scope.dwBounds]);
        } else {
            $scope.bounds = getCombinedBounds([$scope.dwBounds]);
        }

        $scope.center = $scope.bounds.getCenter();
        $scope.zoom = getZoom($scope.bounds, $scope.mapWidth);

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
                    renderStaticMap(ptRouteIsValid);
                });
                $scope.map.setZoom($scope.zoom);
            } else {
                renderStaticMap(ptRouteIsValid);
            }
        });
    };

    var writeTextOnImage = function (context, lineWidth, text, x, y) {

        var f = 36;
        for (; f >= 0; f -= 1) {
            context.font = "bold " + f + "pt Impact, Charcoal, sans-serif";
            if (context.measureText(text).width < canvas.width - 10) {
                context.textAlign = "center";
                context.fillStyle = "white";
                context.strokeStyle = "black";
                context.lineWidth = lineWidth;
                context.fillText(text, x, y);
                context.strokeText(text, x, y);

                break;
            }
        }
    }

    var drawLegend = function(context, gmapsInfo, yStart, width, height, imageHeight) {

        var lineHeight = 3;

        context.beginPath();
        context.rect(1, 0, width-2, yStart);
        context.strokeStyle = '#000000';
        context.lineWidth = lineHeight;
        context.stroke(); 

        context.beginPath();
        context.rect(1, yStart, width-2, height-1);
        context.fillStyle = '#E8E5DC';
        context.fill();
        context.strokeStyle = '#000000';
        context.lineWidth = lineHeight;
        context.stroke(); 

        drawMapSummary(context, 3, width / 2, imageHeight + 20);
    }

    var drawMapSummary = function(context, lineWidth, x, y){
        context.font = "18px Helvetica";
        context.textAlign = "center";
        context.fillStyle = "black";
        context.lineWidth = lineWidth;
        context.lineHeight = 20;
    
        context.fillText(getUserTimeSelectionHeader(), x, y );
        context.fillText('Public Transport:', x, y + 30);
        context.fillText(getPublicTransportDuration() + getPublicTransportWalking(), x, y + 50);
        context.fillText(getOtherModeHeader(), x, y + 80);
        context.fillText(getOtherModeDuration() + getOtherModeDistance(), x, y + 100);
    }

    var getUserTimeSelectionHeader = function(){
        return 'First Service on Sun 1 JUN 2016';
    }
    var getPublicTransportDuration = function(){
        return 'Total time: 1hr 2min  ';
    }
    var getPublicTransportWalking = function(){
        return 'Total walking distance: 2km   ';
    }
    var getOtherModeHeader = function(){
        return 'Driving:';
    }
    var getOtherModeDuration = function(){
        return 'Total time: 20 min   '
    }
    var getOtherModeDistance = function(){
        return 'Total distance: 4km  '
    }

    var drawCircleAt = function(center, context, color, gmapsInfo) {
        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = 5;
        var centerXy = getXYcoords(gmapsInfo, center);
        context.arc(centerXy[0], centerXy[1], 8, 0, 2*Math.PI);
        context.stroke();
    }

    var drawPolylines = function(polylineData, context, lineWidth, lineColor, gmapsInfo) {    

        polylineData.forEach(function(polyline) {
            var latLngArray = polyline['coords'];
            var startCoords = getXYcoords(gmapsInfo, new google.maps.LatLng(latLngArray[0].lat, latLngArray[0].lng));

            context.beginPath();
            context.moveTo(startCoords[0], startCoords[1]);
            for(i=1; i<latLngArray.length; i++) {
                var coord = getXYcoords(gmapsInfo, new google.maps.LatLng(latLngArray[i].lat, latLngArray[i].lng));
                context.lineTo(coord[0], coord[1]);
            }

            if(polyline['mode'] == 'walking') {
                context.setLineDash([5]);                
                context.strokeStyle = "#006400";
                context.lineWidth = 4;
            } else {
                context.setLineDash([]);
                context.strokeStyle = lineColor;
                context.lineWidth = lineWidth;
            }
            context.stroke();            
        });
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
        var lineWidth = 2;
        writeTextOnImage(context, lineWidth, topText, width / 2, 70);
        writeTextOnImage(context, lineWidth, bottomText, width / 2, height - 30);

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
            //return Math.log(mapPx / worldPx / fraction) / Math.LN2;
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
    var findPolylineBounds = function(polylineData) {
        if (polylineData[0]){
            var latMax = polylineData[0].coords[0].lat,
                lngMax = polylineData[0].coords[0].lng,
                latMin = polylineData[0].coords[0].lat,
                lngMin = polylineData[0].coords[0].lng;

            polylineData.forEach(function(polyline) {
                var coords = polyline['coords'];
                for(var i=0; i< polyline.length; i++) {
                    if (coords[i].lat > latMax) { latMax = coords[i].lat; }
                    if (coords[i].lat < latMin) { latMin = coords[i].lat; }
                    if (coords[i].lng > lngMax) { lngMax = coords[i].lng; }
                    if (coords[i].lng < lngMin) { lngMin = coords[i].lng; }
                }
            });

            var boundingRect = new google.maps.LatLngBounds(
                new google.maps.LatLng(latMin, lngMin),
                new google.maps.LatLng(latMax, lngMax)
                
            );

            var center = boundingRect.getCenter();
            var d2sw = getLatLonDistanceInKm(center.lat(), center.lng(), latMin, lngMin);
            var bounds= getSquareBoundingBox(center, d2sw + 0.2);
            return bounds;
        }else 
        return undefined;
    }

    var getLatLonDistanceInKm = function (lat1,lon1,lat2,lon2) {

        var deg2rad = function(deg) { return deg * (Math.PI/180) };

        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2-lat1);  // deg2rad below
        var dLon = deg2rad(lon2-lon1); 
        var a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 

          var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
          var d = R * c; // Distance in km
      
        return d;
    };

    var getSquareBoundingBox = function (centerPoint, distance) {
        /**
         * @param {number} distance - distance (km) from the point represented by centerPoint
         * @param {google.maps.Point} centerPoint - two-dimensional array containing center coords [latitude, longitude]
         * @description
         *   Computes the bounding coordinates of all points on the surface of a sphere
         *   that has a great circle distance to the point represented by the centerPoint
         *   argument that is less or equal to the distance argument.
         *   Technique from: Jan Matuschek <http://JanMatuschek.de/LatitudeLongitudeBoundingCoordinates>
         * @author Alex Salisbury
        */
        var MIN_LAT,
            MAX_LAT,
            MIN_LNG,
            MAX_LNG,
            R,
            radDist,
            degLat,
            degLon,
            radLat,
            radLon,
            minLat,
            maxLat,
            minLon,
            maxLon,
            deltaLon;
        
        // helper functions (degrees<–>radians)
        Number.prototype.degToRad = function () {
            return this * (Math.PI / 180);
        };

        Number.prototype.radToDeg = function () {
            return (180 * this) / Math.PI;
        };
        
        // coordinate limits
        MIN_LAT = (-90).degToRad();
        MAX_LAT = (90).degToRad();
        MIN_LNG = (-180).degToRad();
        MAX_LNG = (180).degToRad();
        
        // Earth's radius (km)
        R = 6378.1;
        
        // angular distance in radians on a great circle
        radDist = distance / R;
        
        // center point coordinates (deg)
        degLat = centerPoint.lat();
        degLon = centerPoint.lng();
        
        // center point coordinates (rad)
        radLat = degLat.degToRad();
        radLon = degLon.degToRad();
        
        // minimum and maximum latitudes for given distance
        minLat = radLat - radDist;
        maxLat = radLat + radDist;
        
        // minimum and maximum longitudes for given distance
        minLon = void 0;
        maxLon = void 0;
        
        // define deltaLon to help determine min and max longitudes
        deltaLon = Math.asin(Math.sin(radDist) / Math.cos(radLat));
        
        if (minLat > MIN_LAT && maxLat < MAX_LAT) {
            minLon = radLon - deltaLon;
            maxLon = radLon + deltaLon;
            if (minLon < MIN_LNG) {
                minLon = minLon + 2 * Math.PI;
            }
            if (maxLon > MAX_LNG) {
                maxLon = maxLon - 2 * Math.PI;
            }
        } else {
            // a pole is within the given distance
            minLat = Math.max(minLat, MIN_LAT);
            maxLat = Math.min(maxLat, MAX_LAT);
            minLon = MIN_LNG;
            maxLon = MAX_LNG;
        }

        var boundingSquare = new google.maps.LatLngBounds(
            new google.maps.LatLng(minLat.radToDeg(), minLon.radToDeg()),
            new google.maps.LatLng(maxLat.radToDeg(), maxLon.radToDeg())
            
        );

        return boundingSquare;
    };

    var shorter = function(duration) {
        return duration.replace('Hour', 'Hr');
    };

    var prettyDistance = function(distance) {
        if(distance < 1000) {
            return "Walk: " + distance + ' m'
        }
        return "Walk: " + Math.round(distance/100)/10 + ' Km'
    }

    var prettyDuration = function(duration) {
        var mins = duration % 60;
        var hrs = (duration - mins)/60;
        var mString = "";
        
        if(mins > 1) {
            mString = mins + ' Mins';
        } else if (mins == 1) {
            mString = mins + ' Min';
        }

        if (hrs > 1) {
            return hrs + ' Hrs ' + mString;
        } else if (hrs == 1) {
            return hrs + ' Hr ' + mString;
        }
        return mString;
    }

    $scope.shareImage = function() {
        
        document.getElementById("meme-validation").innerText = '';

        if ($rootScope.selectedTemplate){
            document.getElementById('map-results').classList.add('done');
            $scope.renderMemeFinal();
            $scope.showImage = true;
            $rootScope.memeShared = true;
            scrollToElement('invisible-map-anchor');
        }
        else{
            document.getElementById("meme-validation").innerText = 'Please choose a meme template to create your meme';
        }
    };

    var initStep2 = function () {

        $rootScope.memeShared = false;
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