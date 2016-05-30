var app = angular.module('bus-meme');

app.controller('MemeController', function ($scope, MemeFactory, $anchorScroll) {
   MemeFactory.getMemeTemplates().then(function(response){
   		$scope.memeTemplates = response.data;
   });
});

app.factory('MemeFactory', ['$http', function ($http) {
    return {
        getMemeTemplates: function(){
           return $http.get('/getMemeTemplates');
        }
    }
}])
