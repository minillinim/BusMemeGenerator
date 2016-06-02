var app = angular.module('bus-meme');

app.controller('MemeController', function ($scope, $rootScope, $location, MemeFactory, $anchorScroll) {

    MemeFactory.getMemeTemplates().then(function (response) {

        $scope.memeTemplates = response.data;
        $scope.selectedTemplate = '';

   		$scope.memeTemplates = response.data;

    });

    $scope.setSelectedTemplate = function (template) {
        $scope.selectedTemplate = template;
        $scope.renderMeme();
    };

    $scope.renderMeme = function () {
        var image = document.getElementById("img-out");
        var canvas = document.getElementById("canvas");
        var context = canvas.getContext("2d");

        var topText = $scope.selectedTemplate.firstLine;
        var bottomText = $scope.selectedTemplate.secondLine;

        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        context.textAlign = "center";
        context.fillStyle = "white";
        context.strokeStyle = "black";
        context.lineWidth = 2;
        writeTextOnImage(context, topText, canvas.width / 2, 70);
        writeTextOnImage(context, bottomText, canvas.width / 2, canvas.height - 30);
        // downloadLink.href = canvas.toDataURL("image/jpeg");
        $('#img-out').hide();
        $rootScope.imageLink = '';
        $rootScope.memeText = $scope.selectedTemplate.firstLine + ' - ' + $scope.selectedTemplate.secondLine;
    };

    function writeTextOnImage(context, text, x, y) {
        var f = 36;
        for (; f >= 0; f -= 1) {
            context.font = "bold " + f + "pt Impact, Charcoal, sans-serif";
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
        saveImageDetails: function (imageDetails) {
            return $http.post('/saveImage', {data: imageDetails});
        },
        getImages: function () {
            return $http.get('/getImages');
        }
    }
}]);
