var request = require('request-promise');
var Q = require("q");  

var user = process.env.TL_USER;
var pass = process.env.TL_PASSWORD;
var auth = new Buffer(user + ':' + pass).toString('base64');

var base_url = "https://opia.api.translink.com.au/v2/";
var location_url = "location/rest/suggest?input="
var plan_url = "travel/rest/plan/";
var stops_url = "location/rest/stops?ids=";

// api constants
var leave_after = 0;
var arrive_before = 1;
var first_services = 2;
var last_services = 3;

var travel_by_bus = 2;
var travel_by_ferry = 4;
var travel_by_train = 8;
var travel_by_walk = 16;
var travel_by_tram = 32;

var default_walk_speed = 1;

function getJourneysBetween(startLat, startLng, endLat, endLng, mode, at, walkMax) {
  //localhost:3000/tl/-27.415458/153.050513/-27.465918/153.025939/after/1464668217/1200/
  tripInfo = {
    "startLat": startLat,
    "startLng": startLng,
    "endLat": endLat,
    "endLng": endLng,
    "walkSpeed": default_walk_speed,
    "walkMax": walkMax,
    "at": _convertTime(at)
  };

  switch(mode) {
    case "after":
      tripInfo["timeMode"] = leave_after;
      break;
    case "before":
      tripInfo["timeMode"] = arrive_before;
      break;
    case "first":
      tripInfo["timeMode"] = first_services;
      break;
    case "last":
      tripInfo["timeMode"] = last_services;
      break;
  }
  console.log(tripInfo);

  var d = Q.defer();
  _getLocation(startLat, startLng)
  .then(
    function(startLoc) {
      if(startLoc) {
        return _getLocation(endLat, endLng)
        .then(
          function(endLoc) {
            if(endLoc) {
              d.resolve(_getJourneysBetween(tripInfo, startLoc, endLoc));
            } else {
              d.resolve(null);
            }
          }
        );
      } else {
        d.resolve(null);
      }
    }
  );
  return d.promise;
}

function _convertTime(timeStamp) {
  var date = new Date(timeStamp*1000);
  var year = date.getFullYear();
  var month = "0" + (date.getMonth() + 1);
  var day = "0" + date.getDate();
  var hours = date.getHours();
  var minutes = "0" + date.getMinutes();
  var seconds = "0" + date.getSeconds();

  return month.substr(-2) + "/" + 
         day.substr(-2) + "/" + 
         year + " " + 
         hours + ':' + 
         minutes.substr(-2) + ':' + 
         seconds.substr(-2);
}

function _getJourneysBetween(tripInfo, startLoc, endLoc) {
  //https://opia.api.translink.com.au/v2/travel/rest/plan/GP:-27.415458,153.050513/GP:-27.465918,153.025939?timeMode=1&at=05/24/16+16:27:00&walkSpeed=1&maximumWalkingDistanceM=1000&api_key=special-key'
  var d = Q.defer();
  var url = base_url + 
            plan_url + 
            startLoc + "/" + endLoc + 
            "?timeMode=" + tripInfo.timeMode + 
            "&at=" + tripInfo.at + 
            "&walkSpeed=" + tripInfo.walkSpeed  + 
            "&maximumWalkingDistanceM=" + tripInfo.walkMax + 
            "&api_key=special-key";

  if(startLoc && endLoc) {
    request.get(
      {
        url: url,
        headers: { 'Authorization': 'Basic ' + auth },
        json: true
      }
    ).then(
      function(response) {
        var itineraries = response.TravelOptions.Itineraries;
        return _processItineraries(tripInfo, [], itineraries);
      }
    ).then(
      function(processedItineraries) {
        d.resolve(processedItineraries);
      }
    );
  } else {
    d.resolve(undefined);
  }
  return d.promise;    
}

function _getLocation(lat, lng) {
  var d = Q.defer();
  if(lat) {
    var url = base_url + location_url + lat + "%2C" + lng + "&filter=0&maxResults=1&api_key=special-key";
    request.get(
      {
        url: url,
        headers: { 'Authorization': 'Basic ' + auth },
        json: true
      }
    ).then(function(response) {
      if(response) {
        if(response.Suggestions.length > 0) {
          d.resolve(response.Suggestions[0].Id);
        }
      }
      d.resolve(null);
    }, function(err) {
      d.resolve(null);
    });
  }
  return d.promise;
}

function _processItineraries(tripInfo, processedItineraries, itineraries) {
  var d = Q.defer();
  if(processedItineraries.length < itineraries.length) {
    var itinerary = itineraries[processedItineraries.length];
    _processLegs(tripInfo, [], itinerary.Legs).then(
      function(processedLegs) {
        var processed_itinerary = {
           "startTime": itinerary.StartTime, 
           "endTime": itinerary.EndTime,
           "totalZones": itinerary.Fare.TotalZones
        };
        
        var total_walk_distance = 0;
        processedLegs.forEach(function(leg) {
          total_walk_distance += leg.totalWalkDistance;
        });

        processed_itinerary["totalWalkDistance"] = total_walk_distance;
        processed_itinerary["Legs"] = processedLegs;
        return processed_itinerary
      }
    ).then(
      function(processed_itinerary) {
        processedItineraries.push(processed_itinerary);
        d.resolve(_processItineraries(tripInfo, processedItineraries, itineraries))
      }
    );
  } else {
    // we're done
    d.resolve(processedItineraries);
  }
  return d.promise;    
}

function _processLegs(tripInfo, processedLegs, legs) {
  var d = Q.defer();

  if(processedLegs.length < legs.length) {
    var leg = legs[processedLegs.length];
    _getStopLocationById(leg.FromStopId, tripInfo.startLat, tripInfo.startLng).then(
      function(locationInfo) {
        var processed_leg = {};
        processed_leg["startDesc"] = locationInfo.Description;
        processed_leg["startLat"] = locationInfo.Position.Lat;
        processed_leg["startLng"] = locationInfo.Position.Lng;
        return processed_leg;
      }
    ).then(
      function(processed_leg) {
        return _getStopLocationById(leg.ToStopId, tripInfo.endLat, tripInfo.endLng).then(
          function(locationInfo) {
            processed_leg["endDesc"] = locationInfo.Description;
            processed_leg["endLat"] = locationInfo.Position.Lat;
            processed_leg["endLng"] = locationInfo.Position.Lng;

            if(leg.TravelMode == travel_by_walk) {
              processed_leg["totalWalkDistance"] = leg.DistanceM;
            } else {
              processed_leg["totalWalkDistance"] = 0;
            }
            return processed_leg;
          }
        );
      }
    ).then(function(processed_leg){
      processedLegs.push(processed_leg);
      d.resolve(_processLegs(tripInfo, processedLegs, legs));
    });
  } else {
    d.resolve(processedLegs)
  }
  return d.promise;    
}

function _getStopLocationById(stopId, lat, lng) {
  var d = Q.defer();
  if(stopId) {
    var url = base_url + stops_url + stopId + "&api_key=special-key";
    request.get(
      {
        url: url,
        headers: { 'Authorization': 'Basic ' + auth },
        json: true
      }
    ).then(
      function(response) {
        if(response) {
          d.resolve(response.Stops[0].ParentLocation);
        }
      }
    );
  } else {
    d.resolve(
      {
        "Description": null,
        "Position": {
          "Lat": lat,
          "Lng": lng
        }
      }
    );
  }
  return d.promise;    
}

module.exports = function() {
  return {
    getJourneysBetween: getJourneysBetween
  }
}