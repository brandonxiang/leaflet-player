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
var lastLayer, timeline, startTime,endTime;

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
    startTime = layers[0].toGeoJSON().features[0].properties.time;
    var endDate = new Date(layers[2].toGeoJSON().features[0].properties.time);
    endDate.setDate(endDate.getDate()+1);
    endTime = endDate.getTime();

    var timelineData = new vis.DataSet([{ start: new Date(startTime), end: endDate, content: "leaflet-player demo" }]);

    var timelineOptions = {
        "width": "100%",
        "height": "120px",
        "style": "box",
        "axisOnTop": true,
        "showCustomTime": true
    }

    timeline = new vis.Timeline(document.getElementById('timeline'), timelineData, timelineOptions);

    timeline.setCustomTime(startDate);

    timeline.on('timechange', function (properties) {
        layerChange(properties.time.getTime());
    })
});

function layerChange(settime) {

    for (var i in layers) {
        var jsontime = layers[i].toGeoJSON().features[0].properties.time;

        if (settime >= jsontime && settime - jsontime < 86400000) {
            var newlayer = layers[i];
            if (lastLayer !== undefined && lastLayer !== newlayer) {
                map.removeLayer(lastLayer);
                map.addLayer(newlayer);
                lastLayer = newlayer;
            }
        }
    }
}

//play button

var playbtn = L.control({ position: 'bottomright' });

playbtn.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this._button = L.DomUtil.create('button', '', this._div);
    this._button.innerHTML = 'Play';
    return this._div;
}

playbtn.addTo(map);

var isPlaying = false;
var player;

$('.info button').click(function () {
    if (isPlaying) {
        //off
        if (player !== undefined) {
            clearInterval(player);
        }
        $(this).html('Play');
        isPlaying = false;
    } else {
        //on
        player = setInterval(function () {
            var newTime = timeline.getCustomTime().getTime() + 60 * 60 * 100*6;
            if(newTime > endTime){
                newTime = startTime;
            }
            layerChange(newTime);
            timeline.setCustomTime(new Date(newTime));
            
        }, 50);
        $(this).html('Stop');
        isPlaying = true;
    }
});
