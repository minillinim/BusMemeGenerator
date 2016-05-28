
// var memeTemplates = [
// 	{firstLine:'Public Transport', secondLine:'FAIL!!!'}, 
// 	{firstLine:'Logan City Council', secondLine:'Needs to invest in Public Transport!'}, 
// 	{firstLine:'Public Transport', secondLine:'Couldnt get much worse...'}, 
// 	{firstLine:'And then you wonder why', secondLine:'everyone owns a car..'}];

// function getMemeTemplates(){

// 	var http = require('http')
// 	http.get('/getMemeTemplates', function (response) {  
//          response.pipe(bl(function (err, data) {  
//          	console.log(data);
//            	if (err)  
//              	return console.error(err)  
       
//        		return data;
//          }))  
//        })  

// 	return memeTemplates;
// }


// var app = angular.module('bus-meme', ['ngRoute']);

// app.config(function ($routeProvider) {
//     $routeProvider.when('/', {
//         templateUrl: 'views/main.html',
//         controller: 'MemeController'
//     })
// });

// app.controller('MemeController', function ($scope, MemeFactory, $anchorScroll) {

//     $scope.getMemeTemplates = function () {
//         console.log('getting you some templates!!!');
//         MemeFactory.getMemeTemplates(function (result, status) {
//         console.log('result is ', result);
//             $scope.$apply(function () {
//                 $scope.memeTemplates = result;
//         		console.log('if Im here then why arent you working...');

//             });
//         });
//     };
// });

