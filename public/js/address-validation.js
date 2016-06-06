var loganPostcodes = ['4114', '4117', '4118','4119','4123','4124','4125','4127','4128','4129','4130','4131','4132','4133','4205','4207','4270','4280','4285']

function validateAddresses(){
	var startPC = document.getElementById("startPostCode").value;
	var startLat = document.getElementById("startAddressLat").value;
	var startLong = document.getElementById("startAddressLong").value;
	var destPC = document.getElementById("destPostCode").value;
	var destLat = document.getElementById("destAddressLat").value;
	var destLong = document.getElementById("destAddressLong").value;
	var errors = [];
	
	if (!startLat || !startLong || !startPC) {
		errors.push("<li>Start address invalid or not found</li>");
	}
	if (!destLat || !destLong || !destPC) {
		errors.push("<li>Destination address invalid or not found</li>");
	}		
						
	if (!addressWithinLoganRegion(startPC) && !addressWithinLoganRegion(destPC)) {
		errors.push("<li>At this point we require at least one address to be within the Logan city bounds.</li>");
	}

	if (bothAddressesAreIdentical(startLat, startLong, destLat, destLong)){
		errors.push("Please enter two different addresses");
	}

	if (errors.length > 0) {	
		document.getElementById("validation-errors").innerHTML = 'There were errors in the information entered: <ul>' + errors.join('') + '</ul>';
		return false;
	}
	
	document.getElementById("validation-errors").innerText = '';
	return true;
}

function addressWithinLoganRegion(postcode)
{
	return loganPostcodes.indexOf(postcode) > -1;
}

function bothAddressesAreIdentical(startLat, startLong, destLat, destLong){
	var addressesIdentical = false;

	if (startLat === destLat && startLong === destLong)
		addressesIdentical = true;

	return addressesIdentical;
}