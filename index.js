import L from "leaflet"

var map
var times = []
var layers = []
var lastLayer
var endTime
var startTime
var timeline

function initMap() {
    var osmUrl = "//api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpbG10dnA3NzY3OTZ0dmtwejN2ZnUycjYifQ.1W5oTOnWXQ9R1w8u3Oo1yA",
        osm = new L.TileLayer(osmUrl, {
            // subdomains:"1234",
            id: "mapbox.outdoors",
            maxZoom: 15,
            attribution: "Map data &copy OpenStreetMap contributors"
        })

    map = new L.Map("map", {
        layers: [osm],
        center: new L.LatLng(22.5, 114.5),
        zoom: 9
    })
}


function getColor(d) {
    return d > 1000 ? "#800026" :
        d > 500 ? "#BD0026" :
        d > 200 ? "#E31A1C" :
        d > 100 ? "#FC4E2A" :
        d > 50 ? "#FD8D3C" :
        d > 20 ? "#FEB24C" :
        d > 10 ? "#FED976" :
        "#FFEDA0"
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.pr),
        weight: 2,
        opacity: 1,
        color: "white",
        dashArray: "3",
        fillOpacity: 0.7
    }
}

function setPlayer(jsons) {
    var promises = []

    for (var i in jsons) {
        var promise = new Promise(function(resolve) {
            $.getJSON(jsons[i], function(json) {
                times.push(json.properties.time)
                var layer = L.geoJson(json, {
                    style: style
                })
                resolve(layer)
            })
        })
        promises.push(promise)
    }

    Promise.all(promises).then(function(value) {
        //init
        layers = value
        map.addLayer(layers[0])
        lastLayer = layers[0]
            //timeline
        var startDate = setJsonDate(times[0])
        var endDate = setJsonDate(times[times.length - 1])
        endDate.setHours(endDate.getHours() + 1)
        startTime = startDate.getTime()
        endTime = endDate.getTime()

        var timelineData = new vis.DataSet([{
            start: startDate,
            end: endDate,
            content: "leaflet-player demo"
        }])

        var timelineOptions = {
            "width": "100%",
            "height": "120px",
            "style": "box",
            "axisOnTop": true,
            "showCustomTime": true
        }

        timeline = new vis.Timeline(document.getElementById("timeline"), timelineData, timelineOptions)

        timeline.setCustomTime(startDate)

        timeline.on("timechange", function(properties) {
            layerChange(properties.time.getTime())
        })
    })
}

function setJsonDate(name) {
    var newDate = new Date()
    newDate.setFullYear(name.substr(0, 4))
    newDate.setMonth(name.substr(4, 2))
    newDate.setDate(name.substr(6, 2))
    newDate.setHours(name.substr(8, 2))
    newDate.setMinutes("0")
    newDate.setSeconds("0")
    return newDate
}

function layerChange(currentTime) {
    var currentDate = new Date(currentTime)

    for (var i in layers) {
        var jsonDate = setJsonDate(times[i])

        if (currentDate >= jsonDate && currentDate < jsonDate.setHours(jsonDate.getHours() + 1)) {
            var newlayer = layers[i]
            if (lastLayer !== undefined && lastLayer !== newlayer) {
                map.removeLayer(lastLayer)
                map.addLayer(newlayer)
                lastLayer = newlayer
                return
            }
        }
    }
}


function initControl(interval) {
    //play button
    var playbtn = L.control({
        position: "bottomright"
    })

    playbtn.onAdd = function() {
        this._div = L.DomUtil.create("div", "info")
        this._button = L.DomUtil.create("button", "", this._div)
        this._button.innerHTML = "Play"
        return this._div
    }

    playbtn.addTo(map)

    var isPlaying = false
    var player

    $(".info button").click(function() {
        if (isPlaying) {
            //off
            if (player !== undefined) {
                clearInterval(player)
            }
            this.innerHTML = "Play"
            isPlaying = false
        } else {
            //on
            player = setInterval(function() {
                //调节速度
                var newTime = timeline.getCustomTime().getTime() + interval
                if (newTime > endTime) {
                    newTime = startTime
                }
                layerChange(newTime)
                timeline.setCustomTime(new Date(newTime))

            }, 50)
            this.innerHTML = "Stop"
            isPlaying = true
        }
    })

}

function init() {
    initMap()
    initControl(1000 * 60)
    var jsons = ["json/2016072508.json", "json/2016072509.json", "json/2016072510.json"]
    setPlayer(jsons)
}

init()
