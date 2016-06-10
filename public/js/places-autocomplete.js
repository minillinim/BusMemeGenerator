function loadGoogleAutocomplete(){

        setTimeout(function() {

            // default autoComplete bounds to Logan city area
            var defaultBounds = new google.maps.LatLngBounds(
              new google.maps.LatLng(-27.641505, 153.106308));

            var options = { bounds: defaultBounds };

            var startAddress = new google.maps.places.Autocomplete(document.getElementById('start-address'), options);
            var destAddress = new google.maps.places.Autocomplete(document.getElementById('dest-address'), options);

            setGoogleListener(startAddress, 'start');
            setGoogleListener(destAddress, 'dest');

    }, 1000);
}

function setGoogleListener(control, name){
    
    google.maps.event.addListener(control, 'place_changed', function () {
                
        var place = control.getPlace();
        var address = place.formatted_address;
        if (!place.geometry) {
            console.debug("Google Maps API call returned an empty address, please try to provide an other place");
            return;
        }
        var latitude = place.geometry.location.lat();
        var longitude = place.geometry.location.lng();
            
        getLocationInfo(latitude, longitude).then(
            function (info) {
                setAddressDetails(name, latitude, longitude, info.postCode, info.suburb);
            }, 
            function (err) {
                console.debug('An error occurred during postcode resolution.', err);
            }
        ); 
    });
    
    $("#dest-address").keydown(function () {
        setAddressDetails('dest', '','','','');        
    });
    $("#start-address").keydown(function () {
        setAddressDetails('start', '','','','');
    });

}

function setAddressDetails(name, lat, long, postcode, suburb){
    document.getElementById(name + "PostCode").value = postcode;                        
    document.getElementById(name + "Suburb").value = suburb;                        
    document.getElementById(name + "AddressLat").value = lat;
    document.getElementById(name + "AddressLong").value = long;
}

function readPostalCode(place) {

    var outOfBoundAddress = false;
    var postcode = '';
    for (var i = 0; i < place.address_components.length; i++) {
        var addressType = place.address_components[i].types[0];    
        if (addressType === 'country' && 'Australia' !== place.address_components[i].long_name) {
            outOfBoundAddress = true;
            break;            
        } 
        if (addressType === 'postal_code') {
            postcode = place.address_components[i].short_name;
        }
    }

    if (!outOfBoundAddress) {
        return postcode;
    }

    return '';    
}

function readSuburb(place) {

    var suburb = '';
    for (var i = 0; i < place.address_components.length; i++) {
        if(place.address_components[i].types.length == 2) {
            if(place.address_components[i].types[0] === 'locality' && place.address_components[i].types[1] === 'political') {
                suburb = place.address_components[i].short_name;
                break;
            }
        }
    }
    return suburb;
}

function getLocationInfo(latitude, longitude) {
    var deferred = $.Deferred(),
        geocoder = new google.maps.Geocoder;
        
    geocoder.geocode(
        {'location': {lat: latitude, lng: longitude} }, 
        function(results, status) {
            var postcode = '';
            if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
                for (var i = 0; i < results.length; i++) {
                    postcode = readPostalCode(results[i]);
                    if ('' != postcode) {
                        var suburb = readSuburb(results[i]);
                        deferred.resolve( { 'postCode': postcode, 'suburb': suburb } );
                        break;
                    }
                }
            }
            if (postcode == '') {
                deferred.reject(status);
            }   
        }
    );

    return deferred.promise();
}
