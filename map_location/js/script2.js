 



var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',{
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
});


  var top5arr = [];
  var bottom5arr = [];

  var myZoom = 9;
  //now the fun stuff:  leaflet!
  var map1 = L.map('map1').setView( [40.743615, -73.925285], 10);
    map1.addLayer(layer)
      //ask the location of the user
    map1.locate({setView: true, maxZoom: 16});

    function onLocationFound(e) {
    var radius = e.accuracy / 2;

    L.marker(e.latlng).addTo(map1)
        .bindPopup("You are within " + radius  +" meters"  + "<br>" + "from this point").openPopup();

    L.circle(e.latlng, radius).addTo(map1);
}

map1.on('locationfound', onLocationFound);
function onLocationError(e) {
    alert(e.message);
}

map1.on('locationerror', onLocationError);
    


$('#ex1').slider({
  formatter: function(value) {
    return 'Value: ' + value;
  }
});


  var geojson;

  //this function takes a value and returns a color based on which bucket the value falls between
  function getColor(crimes) {
      return crimes > 40 ? '#800026' :
             crimes > 32  ? '#BD0026' :
             crimes > 25  ? '#E31A1C' :
             crimes > 20  ? '#FD8D3C' :

                        '#FED976';
  }

  var legend = L.control({position: 'topright'});
  legend.onAdd = function (map) {

      var div = L.DomUtil.create('div', 'info legend'),
          grades = [0, 20, 25, 32, 40],
          labels = [];

      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] +  '<br>' : '+');
      }
      return div;
  };

  legend.addTo(map1);

  var mapColorType = "Crime2014_forgeojson_NORMALIZED_TOTAL_PER1000PPL";
  //this function returns a style object, but dynamically sets fillColor based on the data
  function style(feature) {
    // console.log(feature.properties[mapColorType]);
    return {
        fillColor: getColor(feature.properties[mapColorType]),
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '0',
        fillOpacity: 0.6
    };
  }

  function changeType(){
    var type = $('#dropDown :selected').val();
    // console.log("type" + type); 
    if(mapColorType != type) {
      mapColorType = type;
        $.getJSON('data/Crime.geojson', function(state_data) {
          console.log(state_data);
          geojson = L.geoJson(state_data,{
            style: style, 
            onEachFeature: onEachFeature
          }).addTo(map1);
        });
    }
  }
  //this function is set to run when a user mouses over any polygon
  function mouseoverFunction(e) {
    var layer = e.target;
    var feature = layer.feature;

    layer.setStyle({
        weight: 5,
        opacity: 1,
        color: '#fff',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }

    //update the text in the infowindow with whatever was in the data
    console.log(feature);

    //console.log(layer.feature.properties.rbLocation); 
    $('#infoWindow').html('<br>' + 'NYPD Precinct: ' + layer.feature.properties.Precinct + '<h3>'+ layer.feature.properties[mapColorType] + '<br>' + '</h3>'+ '<br>'  + 'Crime Complaints per 1000 people'); 

  }

  //this runs on mouseout
  function resetHighlight(e) {
    geojson.resetStyle(e.target);
  }

  //this is executed once for each feature in the data, and adds listeners
  function onEachFeature(feature, layer) {
    var cattype = $('#dropDown :selected').val();
    top5arr.push(feature.properties[mapColorType]);
    //console.log(feature.properties[cattype])  
    layer.on({
        mouseover: mouseoverFunction,
        mouseout: resetHighlight
 
    });
  }


  //specify style and onEachFeature options when calling L.geoJson().
  //adding data from my geojson file
  $.getJSON('data/Crime.geojson', function(state_data) {
    console.log(state_data);
    geojson = L.geoJson(state_data,{
      style: style, 
      onEachFeature: onEachFeature
    }).addTo(map1);
  });


