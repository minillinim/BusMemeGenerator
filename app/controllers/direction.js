var request = require("request");

var directions = function(){
	return request.get('http://maps.googleapis.com/maps/api/directions/json?&mode=DRIVING&origin=brisbane&destination=sydney', function (error, response, body) {
		return response.body;
	});
};

module.exports = directions

	