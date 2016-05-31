var app = angular.module('bus-meme');

app.controller('MemeController', function ($scope, MemeFactory, $anchorScroll) {
    MemeFactory.getMemeTemplates().then(function(response){
   		$scope.memeTemplates = response.data;
    });
    $scope.memeReady = false;

	var imageContainer = document.getElementById("map-image");
	var image = document.getElementById("img-out");
	var canvas = document.getElementById("canvas"); 
	var context = canvas.getContext("2d");

	var topText = 'Public Transport';
	var bottomText = 'FAIL!!!';

	$scope.renderMeme = function () {

	    canvas.width = image.width;
	    canvas.height = image.height;
	    context.drawImage(image, 0, 0, canvas.width, canvas.height);
	    context.textAlign = "center";
	    context.fillStyle = "white";
	    context.strokeStyle = "black";
	    context.lineWidth = 2;
	    writeTextOnImage(topText, canvas.width / 2, 50);
	    writeTextOnImage(bottomText, canvas.width / 2, canvas.height - 20);
	    $scope.memeReady = true;

	    function writeTextOnImage (text, x, y) {
	        var f = 36; 
	        for (; f >= 0; f -=1) {
	            context.font = "bold " + f + "pt Impact, Charcoal, sans-serif";
	            if (context.measureText(text).width < canvas.width - 10) {
	                context.fillText(text, x, y);
	                context.strokeText(text, x, y);
	                break;
	            }
	        }
	    };
	};
});

app.factory('MemeFactory', ['$http', function ($http) {
    return {
        getMemeTemplates: function(){
           return $http.get('/getMemeTemplates');
        }
    }
}])
