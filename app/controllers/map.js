var request = require("request");

var directions = function(startAddressLat,startAddressLong, destAddressLat, destAddressLong){
	return request.get('https://maps.googleapis.com/maps/api/directions/json?&mode=DRIVING&origin='+ startAddressLat +','+startAddressLong+'&destination='+ destAddressLat+','+destAddressLong, function (error, response, body) {
		return response.body;
	});
};

module.exports = directions;

	