var http = require('http');
var querystring = require('querystring');
var url = require('url');
var fs = require('fs');

var jsonreq = require('jsonreq');
var socketio = require('socket.io');
var async = require('async');

var express = require('express');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Vacations'
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
io = socketio.listen(app);

io.sockets.on('connection', function (socket) {
	
	socket.on('geocodeAddress', function (data) {
		var address = data['address'];
		var isPublic = data['isPublic']
		reverseGeocode(address, function (result) {
			if(isPublic){
				io.sockets.emit('successfulGeocode', result);
			} else {
				socket.emit('successfulGeocode', result);
			}
			});
		});
		
	socket.on('showVacations', function (data) {
		fs.readFile('vacations.json', function (err, data) {
			if(err){
				console.log(JSON.stringify(err));
			} else {
				try{
					var vacations = JSON.parse(data);	
				} catch(Exception){
					console.log(JSON.stringify(Exception));
					vacations=[];
				}

				async.forEachSeries(vacations['places'],function (each, forEachCallback) {
					reverseGeocode(each, function (result) {
						sleep(0.2,forEachCallback);
						socket.emit('successfulGeocode', result);
					});
				}, function (error) {
					if(error){
						console.log(JSON.stringify(error));
					}
				});
			}
		});
	});
});


var reverseGeoBasePath = 'http://maps.google.com/maps/api/geocode/json?';

var reverseGeocode = function reverseGeocode (address, callback) {
	var requestParameters = {sensor: 'false', address: address};
	var query = querystring.stringify(requestParameters);
	
	jsonreq.post(reverseGeoBasePath + query, requestParameters, function (err, apiResponse) {
		if(apiResponse["status"] === 'OK'){
			var location = apiResponse["results"][0]["geometry"]["location"];
			var address = apiResponse["results"][0]["formatted_address"];
			var result = [{"location": location, "label": address}];
			callback(result);
		} else {
			console.log(JSON.stringify(apiResponse));
			callback(undefined);
		}
	});
}

var sleep = function sleep (seconds, callback) {
	setTimeout(callback, seconds * 1000);
}