var loganPostcodes = ['4114', '4117', '4118','4119','4123','4124','4125','4127','4128','4129','4130','4131','4132','4133','4205','4207','4270','4280','4285']

function validateAddresses(){

	var startPC = document.getElementById("startPostCode").value;
	var startLan = document.getElementById("startAddressLat").value;
	var startLong = document.getElementById("startAddressLong").value;
	var destPC = document.getElementById("destPostCode").value;
	var destLat = document.getElementById("destAddressLat").value;
	var destLong = document.getElementById("destAddressLong").value;

	if (startLan && startLong && destLat && destLong) {
		if (addressWithinLoganRegion(startPC) || addressWithinLoganRegion(destPC)) {
			document.getElementById("validation-errors").innerText = "";
			return true;
		} else {
			document.getElementById("validation-errors").innerText = "At this point we require at least one address to be within the Logan city bounds.";
		}
	} else {
		document.getElementById("validation-errors").innerText = "Both addresses required";
	}

	return false;
}

function addressWithinLoganRegion(postcode)
{
	return loganPostcodes.indexOf(postcode) > -1;
}