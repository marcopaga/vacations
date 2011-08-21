var socket = io.connect();

  var map = undefined;

  var initMap = function initMap() {
    var latlng = new google.maps.LatLng(51.21, 6.78);
    var myOptions = {
      zoom: 8,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
  }
  
  socket.on('successfulGeocode', function (locationInfo) {
    $.each(locationInfo, function (index, value) {
      var location = value['location'];
      var latLng = new google.maps.LatLng(location['lat'], location['lng']);
      var newMarker = new google.maps.Marker({
        position: latLng,
        map: map,
        title: locationInfo['label']
      });
      map.setCenter(latLng);
    });
    
  });
  
  socket.on('showRoute', function (routeInfo) {
    var label = routeInfo['label'];
    var routeLocations = routeInfo['routeLocations'];
    
    console.log(label);
    console.log(routeLocations);
  });  
  
  $(document).ready(function(){
    initMap();
    
    $('#searchButton').click(function() {  
      var address = $('#address').val();
      var isPublic = ( $('#isPublic:checked').val() !== undefined);
      socket.emit('geocodeAddress', {'address': address, 'isPublic': isPublic});
      });
      
    $('#showVacationsButton').click(function () {
      socket.emit('showVacations');
      map.setZoom(3);
    });
    
   });
