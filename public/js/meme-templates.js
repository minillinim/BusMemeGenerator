var app = angular.module('bus-meme');

app.controller('MemeController', function ($scope, MemeFactory, $anchorScroll) {
   MemeFactory.getMemeTemplates().then(function(response){
   		$scope.memeTemplates = response.data;
   });

	// var e = {}, // A container for DOM elements
	//     image = new Image(),
	//     ctxt = null, // For canvas' 2d context
	//     renderMeme = null, // For a function to render memes
	//     get = function (id) {
	//         // Short for document.getElementById()
	//         return document.getElementById(id);
	//     };
	// // Get elements (by id):\
	// e.imageContainer = get("map-image");
	// e.topline = get("topline");
	// e.bottomline = get("bottomline");
	// e.canvas = get("canvas"); // canvas;
	// // Get canvas context:
	// ctxt = e.canvas.getContext("2d");

 //   	$scope.renderMeme = function () {
	//     e.canvas.width = image.width;
	//     e.canvas.height = image.height;
	//     ctxt.drawImage(image, 0, 0, e.canvas.width, e.canvas.height);
	//     ctxt.textAlign = "center";
	//     ctxt.fillStyle = "white";
	//     ctxt.strokeStyle = "black";
	//     ctxt.lineWidth = 2;
	//     writeText(e.topline.value, e.canvas.width / 2, 50);
	//     writeText(e.bottomline.value, e.canvas.width / 2, e.canvas.height - 20);
	//     e.downloadLink.href = e.canvas.toDataURL("image/jpeg");

	//     var writeText = function (text, x, y) {
	//         var f = 36; // Font size (in pt)
	//         for (; f >= 0; f -=1) {
	//             ctxt.font = "bold " + f + "pt Impact, Charcoal, sans-serif";
	//             if (ctxt.measureText(text).width < e.canvas.width - 10) {
	//                 ctxt.fillText(text, x, y);
	//                 ctxt.strokeText(text, x, y);
	//                 break;
	//             }
	//         }
	//     };
	// };
});

app.factory('MemeFactory', ['$http', function ($http) {
    return {
        getMemeTemplates: function(){
           return $http.get('/getMemeTemplates');
        }
    }
}])
