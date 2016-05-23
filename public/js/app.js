var app = angular.module('BusMeme', []);

app.controller('BusDirections', function($scope, GoogleAPIService, $location){
	$scope.startAddress = "hello";
	GoogleAPIService.getDirections().then(function(response){
		$scope.directions = response;
	});

});


app.factory('GoogleAPIService', function($http){
	return {
		getDirections: function(){
			return $http.get("http://localhost:3000/directions");
		}
	}
});