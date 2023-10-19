// Creating the tile layers
var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

var OpenStreetMap_HOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
    });
 
// Creating the base layers
var baseMaps = {
    "Open Street Map": OpenStreetMap_HOT,
    "Open Topo Map": OpenTopoMap
};

// Creating the map object
let myMap = L.map("map", {
    center: [29.96344, -27.54366],
    zoomSnap:0.25,
    zoom: 2.5,
    doubleClickZoom: true
  });

// Adding tile layers to map
OpenStreetMap_HOT.addTo(myMap);
OpenTopoMap.addTo(myMap);

// Adding layer control to the map
layerControl = L.control.layers(baseMaps).addTo(myMap);

// Setting up the legend.
let legend = L.control({ position: "bottomright" });
legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");

    // Adding the gradients and labels.
    let legendInfo = 
    "<div class='legend'>" +
    "<div class='legend-title'> Earthquake Depth</div>" +
    "<div class='legend-scale'>"+
      "<ul class='legend-labels'>" +
        "<li><span style='background:#F8BBD0;'></span>0-10</li>" +
        "<li><span style='background:#EC53B0;'></span>11-30</li>" +
        "<li><span style='background:#9D44C0;'></span>31-50</li>" +
        "<li><span style='background:#4D2DB7;'></span>51-70</li>" +
        "<li><span style='background:#0E21A0;'></span>70-90</li>" +
        "<li><span style='background:#0C1039;'></span> +90</li>" +
      "</ul>" +
    "</div>" +
    "</div>";

    div.innerHTML = legendInfo;
    return div;
    };

// Adding the legend to the map
legend.addTo(myMap);

// Function to find the size of the markers based on the magnitude of the earthquake
function markerSize(mag) {
    return Math.sqrt(mag) * 10 ;
}

// Fuction to assign color to the markers based on the depth of the earthquake
function markerColor (depth) {
    if (depth <= 10) {
        return "#F8BBD0"
    } else if (depth <= 50) {
        return "#EC53B0" 
    } else if (depth <= 50) {
        return "#9D44C0"
    }  else if (depth <= 70) {
        return "#4D2DB7"
    }  else if (depth <= 90) {
        return "#0E21A0"
    } else if (depth > 90) {
        return "#0C1039"
    }
}

// Function to create the markers
function makeMarkers(response) {

    let features = response.features
    let quakeMarkers = L.layerGroup();// creating the layerGroup for the markers
    for (let i = 0; i < features.length; i++) {
        let feature = features[i];
        let magnitude = features[i].properties.mag;
        let radiusC = markerSize(magnitude);
        let coordinates = feature.geometry.coordinates
        // console.log(feature.properties.place); // verifying data selected
        // let quakeMarker = L.marker([coordinates[1], coordinates[0]]); 
        let quakeMarker = L.circleMarker([coordinates[1], coordinates[0]], {
            title: feature.properties.place,    
            color: "#0f0f0f",
            fillColor: markerColor(coordinates[2]),
            fillOpacity: .75,
            radius: radiusC
        }).bindPopup("<h3>Location: " + feature.properties.place + "<br>Magnitude: " + magnitude + "<br>Depth: " + coordinates[2] + "</h3>");
        quakeMarker.addTo(quakeMarkers);
    }

    quakeMarkers.addTo(myMap);
    layerControl.addOverlay(quakeMarkers, "Earthquakes");
}

// Saving the link for the Earthquake website
let link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Connecting to link via D3
d3.json(link).then((response) => {
    makeMarkers(response);
});


