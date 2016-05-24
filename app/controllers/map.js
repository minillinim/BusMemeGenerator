var request = require("request");

var directions = function(startAddress, destAddress){
	return request.get('http://maps.googleapis.com/maps/api/directions/json?&mode=DRIVING&origin='+ startAddress+'&destination='+ destAddress, function (error, response, body) {
		console.log(response.body);
		return response.body;
	});
};
module.exports = directions

	