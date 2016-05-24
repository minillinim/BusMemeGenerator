var request = require("request");
var tl_api = require('../helpers/translinkapi');

console.log(tl_api.getLocation)

var directions = function(startAddress, destAddress){
	return request.get('http://maps.googleapis.com/maps/api/directions/json?&mode=DRIVING&origin='+ startAddress+'&destination='+ destAddress, function (error, response, body) {
        googleAPIResponse = JSON.parse(response.body);
        if(googleAPIResponse.status !== "NOT_FOUND") {
            var startStops = extractStartStop(googleAPIResponse);
            if("start_location" in startStops) {
                var start_location = tl_api.getLocation(startStops.start_location.lat, startStops.start_location.lng);
                var end_location = tl_api.getLocation(startStops.end_location.lat, startStops.end_location.lng);
            }
        }
        return response.body;
	});
};

function extractStartStop(googleAPIResponse) {
    if(googleAPIResponse.routes.length > 0) {
        return {"start_location" : googleAPIResponse.routes[0].legs[0].start_location,
                "end_location" : googleAPIResponse.routes[0].legs[0].end_location};
    }
    return {};
}

module.exports = directions

	