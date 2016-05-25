var request = require('request-promise');

var user = process.env.TL_USER;
var pass = process.env.TL_PASSWORD;
var auth = new Buffer(user + ':' + pass).toString('base64');

var base_url = "https://opia.api.translink.com.au/v2/";
var location_url = "location/rest/suggest?input="
var plan_url = "travel/rest/plan/";

// api constants
var leave_after = 0;
var arrive_before = 1;
var first_services = 2;
var last_services = 3;

var default_walk_speed = 1;
var default_walk_max = 1000;

var default_time = "05/24/16 16:27:00"

function getLocation(lat, lng) {
  if(lat) {
    return request.get(
      {
        url: base_url + location_url + lat + "%2C" + lng + "&filter=0&maxResults=1&api_key=special-key",
        headers: { 'Authorization': 'Basic ' + auth },
        json: true
      }
    ).then(function(response) {
      if(response) {
        if(response.Suggestions.length > 0) {
          return response.Suggestions[0].Id;
        }
      }
      return undefined;
    }, function(err) {
      console.log(err);
      return undefined;
    });
  }
}

function getJourneysBetween(startLat, startLng, endLat, endLng) {
  return getLocation(startLat, startLng)
    .then(function(startLoc) {
      if(startLoc) {
        return getLocation(endLat, endLng).then(function(endLoc) {
          if(endLoc) {
            return _getJourneysBetween(startLoc, endLoc);  
          }
        }, function(err) {
          console.log(err);
          return undefined;
        });
      }
      return undefined;
    }
  );
}

function _getJourneysBetween(startLoc, endLoc) {
  //localhost:3000/tl/-27.415458/153.050513/-27.465918/153.025939
  //https://opia.api.translink.com.au/v2/travel/rest/plan/GP:-27.415458,153.050513/GP:-27.465918,153.025939?timeMode=1&at=05/24/16+16:27:00&walkSpeed=1&maximumWalkingDistanceM=1000&api_key=special-key'
  var url = base_url + plan_url + startLoc + "/" + endLoc + "?timeMode=" + leave_after + "&at=" + default_time + "&walkSpeed=" + default_walk_speed  + "&maximumWalkingDistanceM=" + default_walk_max + "&api_key=special-key";
  console.log(url);
  if(startLoc && endLoc) {
    return request.get(
      {
        url: url,
        headers: { 'Authorization': 'Basic ' + auth },
        json: true
      }
    ).then(function(response) {
      console.log(response.TravelOptions.Itineraries[0].Legs)
      return response.TravelOptions.Itineraries;
    });
  }
  return undefined;
}

module.exports = function() {
  return {
    getLocation: getLocation,
    getJourneysBetween: getJourneysBetween
  }
}