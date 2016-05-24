google.maps.event.addDomListener(window, 'load', function () {
    var startAddress = new google.maps.places.Autocomplete(document.getElementById('start-address'));
    var destAddress = new google.maps.places.Autocomplete(document.getElementById('dest-address'));
    google.maps.event.addListener(startAddress, 'place_changed', function () {
        var place = startAddress.getPlace();
        var address = place.formatted_address;
        var latitude = place.geometry.location.lat();
        var longitude = place.geometry.location.lng();

        document.getElementById("startAddressLat").value = latitude;
        document.getElementById("startAddressLong").value = longitude;
    });
    google.maps.event.addListener(destAddress, 'place_changed', function () {
        var place = destAddress.getPlace();
        var address = place.formatted_address;
        var latitude = place.geometry.location.lat();
        var longitude = place.geometry.location.lng();

        document.getElementById("destAddressLat").value = latitude;
        document.getElementById("destAddressLong").value = longitude;
    });
});