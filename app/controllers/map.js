var request = require("request");
var tl_api = require('../helpers/translinkapi');

var directions = function(startAddressLat,startAddressLong, destAddressLat, destAddressLong){
	return request.get('https://maps.googleapis.com/maps/api/directions/json?&mode=DRIVING&origin='+ startAddressLat +','+startAddressLong+'&destination='+ destAddressLat+','+destAddressLong, function (error, response, body) {
        var start_location = tl_api.getLocation(startAddressLat,startAddressLong);
        var end_location = tl_api.getLocation(destAddressLat, destAddressLong);
		return response.body;
	});
};

module.exports = directions;

	