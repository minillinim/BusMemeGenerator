var app = angular.module('bus-meme', []);

app.controller('MapController', function($scope, MapService){
	$scope.getMapData = function(){
	validateAddresses();
	$scope.startAddressLat = document.getElementById('startAddressLat').value;
	$scope.startAddressLong= document.getElementById('startAddressLong').value;
	$scope.destAddressLat = document.getElementById('destAddressLat').value;
	$scope.destAddressLong = document.getElementById('destAddressLong').value;

		MapService.getDirections($scope.startAddressLat, $scope.startAddressLong, $scope.destAddressLat, $scope.destAddressLong).then(function(response){
			$scope.mapData = response.data;
			console.log($scope.mapData);
		});

	}
});

app.factory('MapService',function($http, $location){
	return {
		getDirections: function(startAddressLat, startAddressLong,destAddressLat, destAddressLong ){
			return $http.get($location.$$absUrl+'map/'+startAddressLat +'/'+ startAddressLong+'/'+destAddressLat + '/'+ destAddressLong)
		}
	};
})