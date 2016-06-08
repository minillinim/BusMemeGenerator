var app = angular.module('bus-meme');

app.factory('FacebookService', function (BusMemeConfig) {
    return {
        intialiseFacebook: function(){
            window.fbAsyncInit = function () {
                FB.init({
                    appId: BusMemeConfig.FACEBOOK_APP_ID,
                    xfbml: true,
                    version: 'v2.6'
                });
            };

            var js, fjs = document.getElementsByTagName('script')[0];
            if (document.getElementById('facebook-jssdk')) {
                return;
            }
            js = document.createElement('script');
            js.id = 'facebook-jssdk';
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }
    }
});