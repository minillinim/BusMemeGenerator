var app = angular.module('bus-meme');

app.controller('MemeController', function ($scope, $rootScope, $location, MemeFactory, $anchorScroll) {
    $rootScope.showTemplates = false;
    MemeFactory.getMemeTemplates().then(function (response) {
        $scope.memeTemplates = response.data;
        $rootScope.selectedTemplate = '';

        $scope.memeTemplates = response.data;
    });

    $scope.handleOverlay = function(){
        if (!$rootScope.memeShared){
            $rootScope.showTemplates=true;
            document.getElementById("templates").className="template-selection";
            document.getElementById("map-overlay").className="map-overlay";   
        }
    };
    $scope.setSelectedTemplate = function (template) {
        document.getElementById("meme-validation").innerText = '';
        $rootScope.selectedTemplate = template;
        $scope.renderMemeTemplate();
        $rootScope.showTemplates=false;
        $scope.showTooltip();
    };

    $scope.showTooltip = function(){
        $("#meme-tooltip").show().delay(5000).fadeOut();
    };

    $scope.renderMemeTemplate = function () {
        $('#canvas2').remove();
        $('<canvas>', {'id': 'canvas2'}).insertAfter($('#canvas'));

        var canvas = document.getElementById("canvas2");
        var context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);

        var image = document.getElementById('img-out');
        canvas.width = image.width;
        canvas.height = image.height;

        var topText = $rootScope.selectedTemplate.firstLine;
        var bottomText = $rootScope.selectedTemplate.secondLine;

        context.textAlign = "center";
        context.fillStyle = "white";
        context.strokeStyle = "black";
        context.lineWidth = 2;

        writeTextOnImage(context, topText, canvas.width / 2, 70);
        writeTextOnImage(context, bottomText, canvas.width / 2, canvas.height - 30);
    };

    function scrollToElement(id) {
        setTimeout(function () {
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
            return $http.get('/logan/getMemeTemplates');
        },
        saveImageDetails: function (imageDetails) {
            return $http.post('/logan/saveImage', {data: imageDetails});
        },
        getImages: function () {
            return $http.get('/logan/getImages');
        },
        saveUserDetails: function (userDetails) {
            return $http.post('/logan/saveUser', {data: userDetails});
        }
    }
}]);

