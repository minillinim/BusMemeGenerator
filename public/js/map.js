var app = angular.module('bus-meme', ['ngRoute']);

app.config(function($routeProvider){
	$routeProvider.when('/', {
    templateUrl: 'views/main.html',
    controller: 'MapController'
  })
});

app.controller('MapController', function($scope, MapService, $location){

	$scope.getMapData = function(){
		MapService.initMap();
		if (validateAddresses()){
			$scope.startAddressLat = document.getElementById('startAddressLat').value;
			$scope.startAddressLong= document.getElementById('startAddressLong').value;
			$scope.destAddressLat = document.getElementById('destAddressLat').value;
			$scope.destAddressLong = document.getElementById('destAddressLong').value;

			document.getElementById('map-results').className = 'showmap';

			MapService.getDirections($scope.startAddressLat, $scope.startAddressLong, $scope.destAddressLat, $scope.destAddressLong).then(function(response){
				$scope.mapData = response.data;
			});
		}else{

			document.getElementById('map-results').className = "";
		}
	}
	
});

app.factory('MapService',function($http, $location){
	return {
		getDirections: function(startAddressLat, startAddressLong,destAddressLat, destAddressLong ){
			return $http.get($location.$$absUrl+'map/'+startAddressLat +'/'+ startAddressLong+'/'+destAddressLat + '/'+ destAddressLong)
		},
		initMap: function (){
			var myOptions = 
			{
				zoom:11,
				center:new google.maps.LatLng(-27.6410476,153.10750899999994),
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};

			map = new google.maps.Map(document.getElementById('gmap_canvas'), myOptions);
			marker = new google.maps.Marker({map: map,position: new google.maps.LatLng(-27.6410476,153.10750899999994)});

			infowindow = new google.maps.InfoWindow(
				{content:'<strong>Bus Meme Generator</strong><br>Logan, QLD<br>'});

			google.maps.event.addListener(marker, 'click', function(){
				infowindow.open(map,marker);
			});

			infowindow.open(map,marker);
		}
	};
})