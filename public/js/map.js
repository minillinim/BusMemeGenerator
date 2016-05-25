var app = angular.module('bus-meme', ['ngRoute']);

app.config(function($routeProvider){
	$routeProvider.when('/', {
    templateUrl: 'views/main.html',
    controller: 'MapController'
  })
});

app.controller('MapController', function($scope, MapService, $location){
	var directionsDisplay;
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
			MapService.getDirections($scope.startAddressLat, $scope.startAddressLong, $scope.destAddressLat, $scope.destAddressLong, function(result, status) {
				console.log('DirectionsService.rout', result, status);
				if (status == google.maps.DirectionsStatus.OK) {
					directionsDisplay.setDirections(result);
				}
			});
		}else{

			document.getElementById('map-results').className = "";
		}
	};

	var initMap = function (){
		directionsDisplay = new google.maps.DirectionsRenderer();
		var logan = new google.maps.LatLng(-27.6410476,153.10750899999994);
		var mapOptions = 			{
			zoom:11,
			center:logan,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};

		map = new google.maps.Map(document.getElementById("gmap_canvas"), mapOptions);
		directionsDisplay.setMap(map);
	}
});

app.factory('MapService',function($http, $location){
	return {
		getDirections: function(startAddressLat, startAddressLong,destAddressLat, destAddressLong, callback){
			var directionsService = new google.maps.DirectionsService();

			var start = new google.maps.LatLng(startAddressLat,startAddressLong);
			var end =new google.maps.LatLng(destAddressLat,destAddressLong);
			var request = {
				origin:start,
				destination:end,
				travelMode: google.maps.TravelMode.DRIVING
			};
			directionsService.route(request, callback);
		}
	};
});

