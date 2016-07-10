var osmUrl = '//api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpbG10dnA3NzY3OTZ0dmtwejN2ZnUycjYifQ.1W5oTOnWXQ9R1w8u3Oo1yA',
    osm = new L.TileLayer(osmUrl, {
        // subdomains:'1234',
        id: 'mapbox.outdoors',
        maxZoom: 15,
        attribution: "Map data &copy; OpenStreetMap contributors"
    });

var map = new L.Map('map', {
    layers: [osm],
    center: new L.LatLng(22.5, 114.5),
    zoom: 9
});

function getColor(d) {
    return d > 1000 ? '#800026' :
        d > 500 ? '#BD0026' :
            d > 200 ? '#E31A1C' :
                d > 100 ? '#FC4E2A' :
                    d > 50 ? '#FD8D3C' :
                        d > 20 ? '#FEB24C' :
                            d > 10 ? '#FED976' :
                                '#FFEDA0';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.pr),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}


var layers = [];
var promises = [];
var lastLayer;

promises.push($.getJSON('1.json', function (data) {
    var one = L.geoJson(data, { style: style });
    //init
    map.addLayer(one);
    lastLayer = one;
    layers.push(one);
}));

promises.push($.getJSON('2.json', function (data) {
    two = L.geoJson(data, { style: style });
    layers.push(two);
}));

promises.push($.getJSON('3.json', function (data) {
    three = L.geoJson(data, { style: style });
    layers.push(three);
}));


Q.all(promises).then(function () {
    //timeline

    var startTime = new Date(layers[0].toGeoJSON().features[0].properties.time);
    var endTime = new Date(layers[2].toGeoJSON().features[0].properties.time);

    var timelineData = new vis.DataSet([{ start: startTime, end: endTime, content: "leaflet-player demo" }]);

    var timelineOptions = {
        "width": "100%",
        "height": "120px",
        "style": "box",
        "axisOnTop": true,
        "showCustomTime": true
    }

    var timeline = new vis.Timeline(document.getElementById('timeline'), timelineData, timelineOptions);

    timeline.setCustomTime(startTime);

    timeline.on('timechange', function (properties) {
        console.log(properties.time);
        for (var i in layers) {
            var jsontime = layers[i].toGeoJSON().features[0].properties.time;
            var settime = properties.time.getTime()
            if (settime >= jsontime && settime - jsontime < 86400000) {
                var newlayer = layers[i];
                if (lastLayer !== undefined && lastLayer !== newlayer) {
                    map.removeLayer(lastLayer);
                    map.addLayer(newlayer);
                    lastLayer = newlayer;
                }
            }
        }
    })
});






