var request = require('request-promise');

var directions = function(startAddressLat,startAddressLong, destAddressLat, destAddressLong){
	return request('https://maps.googleapis.com/maps/api/directions/json?&mode=DRIVING&origin='+ startAddressLat +','+startAddressLong+'&destination='+ destAddressLat+','+destAddressLong);
};

module.exports = directions;

	