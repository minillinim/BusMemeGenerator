var http = require("http");

// var directions = function(app){
// 		return http.get("http://maps.googleapis.com/maps/api/directions/json?&mode=DRIVING&origin=brisbane&destination=sydney", function(response){
// 		 var body = '';
//         response.on('data', function(d) {
//             body += d;
//         });
//         response.on('end', function() {
//             var parsed = JSON.parse(body);
//             console.log(parsed.routes[0].legs[0].duration)
//         });
// 	})
// };

var directions = function(){ return "hello";}

module.exports = directions

	