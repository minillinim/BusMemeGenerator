var app = angular.module('bus-meme');

app.controller('MemeController', function ($scope, MemeFactory, $rootScope, $anchorScroll) {

    MemeFactory.getMemeTemplates().then(function (response) {

        $scope.memeTemplates = response.data;
        $scope.selectedTemplate = $scope.memeTemplates[0];

   		$scope.memeTemplates = response.data;
	    //$scope.selectedTemplate = $scope.memeTemplates[0];

    });

    $scope.setSelectedTemplate = function (template) {
        $scope.selectedTemplate = template;
        $scope.renderMeme();
    };

    $scope.dlCanvas = function () {
        var canvas = document.getElementById("canvas");
        var imageUrl = canvas.toDataURL('image/png');
        console.log(imageUrl);

        MemeFactory.saveImageUrl(imageUrl).then(function (response) {
            console.log(response);
        });

        var dl = document.getElementById('dl');
        //dl.setAttribute('download', 'map.png');
        //dl.setAttribute('href', imageUrl.replace(/^data:image\/[^;]/, 'data:application/octet-stream'));
    };

    $scope.renderMeme = function () {
        var context = $rootScope.context;
        var image = document.getElementById('img-out');

        var topText = $scope.selectedTemplate.firstLine;
        var bottomText = $scope.selectedTemplate.secondLine;

        var width = image.width;
        var height = image.height;
        context.textAlign = "center";
        context.fillStyle = "white";
        context.strokeStyle = "black";
        context.lineWidth = 2;
        writeTextOnImage(context, topText, width / 2, 70);
        writeTextOnImage(context, bottomText, width / 2, height - 30);
    };

    function writeTextOnImage(context, text, x, y) {
        var f = 36;
        for (; f >= 0; f -= 1) {
            context.font = "bold 42pt Impact, Charcoal, sans-serif";
            if (context.measureText(text).width < canvas.width - 10) {
                context.fillText(text, x, y);
                context.strokeText(text, x, y);

                break;
            }
        }
    }
});

app.factory('MemeFactory', ['$http', function ($http) {
    return {
        getMemeTemplates: function () {
            return $http.get('/getMemeTemplates');
        },
        saveImageUrl: function (imageUrl) {
            return $http.post('/saveImageUrl', {data: imageUrl});
        },
        getImages: function(){
            return $http.get('/getImages');
        }
    }
}]);
