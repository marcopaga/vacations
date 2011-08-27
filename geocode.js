var jsonreq = require('jsonreq');
var querystring = require('querystring');

var reverseGeoBasePath = 'http://maps.google.com/maps/api/geocode/json?';

exports.reverseGeocode = function reverseGeocode (address, callback) {
	var requestParameters = {sensor: 'false', address: address};
	var query = querystring.stringify(requestParameters);
	
	jsonreq.post(reverseGeoBasePath + query, requestParameters, function (err, apiResponse) {
		if(apiResponse.status === 'OK'){
			var location = apiResponse["results"][0].geometry.location;
			var address = apiResponse["results"][0].formatted_address;
			var result = [{"location": location, "label": address}];
			callback(result);
		} else {
			console.log(JSON.stringify(apiResponse));
			callback(undefined);
		}
	});
};