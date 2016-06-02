var app = angular.module('bus-meme');

app.controller('MemeController', function ($scope, $rootScope, $location, MemeFactory, $anchorScroll) {

    MemeFactory.getMemeTemplates().then(function (response) {

        $scope.memeTemplates = response.data;
        $rootScope.selectedTemplate = '';

   		$scope.memeTemplates = response.data;

    });

    $scope.setSelectedTemplate = function (template) {
        document.getElementById("meme-validation").innerText = '';
        $rootScope.selectedTemplate = template;
        $scope.renderMeme();
    };

    $scope.renderMeme = function () {
        var context = $rootScope.context;
        var image = document.getElementById('img-out');

        var topText = $rootScope.selectedTemplate.firstLine;
        var bottomText = $rootScope.selectedTemplate.secondLine;

        var width = image.width;
        var height = image.height;
        context.textAlign = "center";
        context.fillStyle = "white";
        context.strokeStyle = "black";
        context.lineWidth = 2;
        writeTextOnImage(context, topText, width / 2, 70);
        writeTextOnImage(context, bottomText, width / 2, height - 30);
    };

    function scrollToElement(id) {
        setTimeout(function () {
            console.log('wth');
            $anchorScroll(id);
        }, 10);
    }

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

