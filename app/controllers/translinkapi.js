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

function _getModeString(mode) {
  if(mode == travel_by_walk) {
    return "walking"
  }
  return "public"
}

function getJourneysBetween(startLat, startLng, destLat, destLng, mode, at, walkMax, sortPreference) {
  //localhost:3000/tl/-27.415458/153.050513/-27.465918/153.025939/after/1464961050/1200/distance
  tripInfo = {
    "startLat": startLat,
    "startLng": startLng,
    "destLat": destLat,
    "destLng": destLng,
    "walkSpeed": default_walk_speed,
    "walkMax": walkMax,
    "at": _convertTime(at),
    "sortPreference": sortPreference
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

  var d = Q.defer();
  _getLocation(startLat, startLng)
  .then(
    function(startLoc) {
      if(startLoc) {
        return _getLocation(destLat, destLng)
        .then(
          function(destLoc) {
            if(destLoc) {
              d.resolve(_getJourneysBetween(tripInfo, startLoc, destLoc));
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

function _getJourneysBetween(tripInfo, startLoc, destLoc) {
  //https://opia.api.translink.com.au/v2/travel/rest/plan/GP:-27.415458,153.050513/GP:-27.465918,153.025939?timeMode=1&at=05/24/16+16:27:00&walkSpeed=1&maximumWalkingDistanceM=1000&api_key=special-key'
  var d = Q.defer();
  var url = base_url + 
            plan_url + 
            startLoc + "/" + destLoc + 
            "?timeMode=" + tripInfo.timeMode + 
            "&at=" + tripInfo.at + 
            "&walkSpeed=" + tripInfo.walkSpeed  + 
            "&maximumWalkingDistanceM=" + tripInfo.walkMax + 
            "&api_key=special-key";

  if(startLoc && destLoc) {
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
        if(processedItineraries.length > 0) {
          d.resolve(_getBestItinerary(processedItineraries, tripInfo.sortPreference));
        } else {
          d.resolve(undefined);
        }
      }
    );
  } else {
    d.resolve(undefined);
  }
  return d.promise;    
}

function _getBestItinerary(itineraries, sortPreference) {
  var checkStruct = {};
      shortest = 100000000000;

  var index = 0;
  console.log(JSON.stringify(itineraries));

  itineraries.forEach(function(itinerary) {
    var walkingDistance = parseInt(itinerary.walkingDistance);
    var duration = parseInt(itinerary.duration);

    if(sortPreference==="distance") {
      if(checkStruct[walkingDistance]) {
        checkStruct[walkingDistance].push([index, duration])
      } else {
        checkStruct[walkingDistance] = [[index, duration]];
      }
      if(walkingDistance < shortest) {
        shortest = walkingDistance;
      }
    } else {
      if(checkStruct[duration]) {
        checkStruct[duration].push([index, walkingDistance]);
      } else {
        checkStruct[duration] = [[index, walkingDistance]];
      }
      if(duration < shortest) {
        shortest = duration;
      }
    }
    index++;
  });

  console.log(JSON.stringify(checkStruct));

  var bestIndex = 0;
  var bestValue = checkStruct[shortest][0][1];
  index = 0;
  checkStruct[shortest].forEach(function(info) {
    if(info[1] < bestValue) {
      bestValue = info[1];
      bestIndex = index;
    }
    index += 1;
  });
  console.log(bestIndex)
  console.log(checkStruct[shortest][bestIndex])
  console.log(itineraries[checkStruct[shortest][bestIndex][0]])
  return itineraries[checkStruct[shortest][bestIndex][0]];
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

function _parseTimeString(timeString) {
  // extract from: '/Date(1464961260000+1000)/'
  return parseInt(timeString.split('(')[1].split('+')[0])
}

function _processItineraries(tripInfo, processedItineraries, itineraries) {
  var d = Q.defer();
  if(processedItineraries.length < itineraries.length) {
    var itinerary = itineraries[processedItineraries.length];
    _processLegs(tripInfo, [], itinerary.Legs).then(
      function(processedLegs) {

        var processed_itinerary = {
           "startTime": _parseTimeString(itinerary.StartTime), 
           "endTime": _parseTimeString(itinerary.EndTime),
           "totalZones": itinerary.Fare.TotalZones
        };
        
        var total_walk_distance = 0;
        var total_duration = 0;

        processedLegs.forEach(function(leg) {
          total_walk_distance += leg.totalWalkDistance;
          total_duration += leg.duration;
        });

        processed_itinerary["walkingDistance"] = total_walk_distance;
        processed_itinerary["duration"] = total_duration;
        processed_itinerary["legs"] = processedLegs;
        
        return processed_itinerary;
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
    var processed_leg = {};

    if(leg.TravelMode == travel_by_walk) {
      processed_leg["totalWalkDistance"] = leg.DistanceM;
    } else {
      processed_leg["totalWalkDistance"] = 0;
    }

    processed_leg["departureTime"] = _parseTimeString(leg.DepartureTime);
    processed_leg["duration"] = leg.DurationMins;
    processed_leg["polyline"] = leg.Polyline;
    processed_leg["travelMode"] = _getModeString(leg.TravelMode);

    processedLegs.push(processed_leg);
    d.resolve(_processLegs(tripInfo, processedLegs, legs));
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