var app = angular.module('bus-meme', ['ngRoute']);

app.config(function($routeProvider){
	$routeProvider.when('/', {
    templateUrl: 'views/main.html',
    controller: 'MapController'
  })
});

app.controller('MapController', function($scope, MapService, $location){
	var transitDirections;
	var drivingOrWalkingDirections;
	var map;
	$scope.showMap = false;

	$scope.getMapData = function(){
		if (validateAddresses()){
			$scope.showMap = true;
			$scope.startAddressLat = document.getElementById('startAddressLat').value;
			$scope.startAddressLong= document.getElementById('startAddressLong').value;
			$scope.destAddressLat = document.getElementById('destAddressLat').value;
			$scope.destAddressLong = document.getElementById('destAddressLong').value;

			document.getElementById('map-results').className = 'showmap';
			initMap();
			var travelOptions = {
				startLat: document.getElementById('startAddressLat').value,
				startLng: document.getElementById('startAddressLong').value,
				destLat: document.getElementById('destAddressLat').value,
				destLng: document.getElementById('destAddressLong').value,
			};

			MapService.getDirections(travelOptions, 'public', function(result, status) {
				console.log('DirectionsService public', $scope.mode, result);
				if (status == google.maps.DirectionsStatus.OK) {
					transitDirections.setDirections(result);
				}
			});
			MapService.getDirections(travelOptions, $scope.mode, function(result, status) {
				console.log('DirectionsService.driving or walking', $scope.mode, result);
				if (status == google.maps.DirectionsStatus.OK) {
					drivingOrWalkingDirections.setDirections(result);
				}
			});

		} else{
			document.getElementById('map-results').className = "";
		}
	};

	var initMap = function (){
		var logan = new google.maps.LatLng(-27.6410476,153.10750899999994);
		var mapOptions = {
			zoom:11,
			center:logan,
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

app.factory('MapService',function(){
	return {
		getDirections: function(travelOptions, mode, callback){
			var directionsService = new google.maps.DirectionsService();

			var start = new google.maps.LatLng(travelOptions.startLat,travelOptions.startLng);
			var end =new google.maps.LatLng(travelOptions.destLat,travelOptions.destLng);
			var request = {
				origin:start,
				destination:end
			};

			switch(mode) {
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

