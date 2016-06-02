var isAddressChanged = false;

google.maps.event.addDomListener(window, 'load', function () {

    loadGoogleAutocomplete();
});

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
            console.error("Google Maps API call returned an empty address, please try to provide an other place");
            return;
        }
        var latitude = place.geometry.location.lat();
        var longitude = place.geometry.location.lng();
            
        getPostalCode(latitude, longitude).then(
            function (postcode) {
                document.getElementById(name + "PostCode").value = postcode;                        
                document.getElementById(name + "AddressLat").value = latitude;
                document.getElementById(name + "AddressLong").value = longitude;
            }, 
            function (err) {
                console.error('An error occurred during postcode resolution.', err);
            }
        ); 
        isAddressChanged = true;                                                  
    });
    
    $("#dest-address").keydown(function () {
        isAddressChanged = false;                                                  
    });
    $("#start-address").keydown(function () {
        isAddressChanged = false;                                                  
    });

}

function readPostalCode(place) {
    for (var i = 0; i < place.address_components.length; i++) {
        var addressType = place.address_components[i].types[0];
        if (addressType == 'postal_code') {
          return place.address_components[i].short_name;
        }
    }
    return '';    
}

function getPostalCode(latitude, longitude) {
    var deferred = $.Deferred(),
        geocoder = new google.maps.Geocoder;
        
    geocoder.geocode(
        {'location': {lat: latitude, lng: longitude} }, 
        function(results, status) {
            if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
                for (var i = 0; i < results.length; i++) {
                    var postcode = readPostalCode(results[i]);
                    if ('' != postcode) {
                        deferred.resolve(postcode);
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
