
var map = L.map('mapid').setView([62.0, 24.945831], 6);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 14,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1Ijoic3Zlbjk3IiwiYSI6ImNqdmJjNmZ6bzE3ZXo0NHBrbGplY3dmazgifQ.DQxxjWhSsZn0whAFGLkE8w'
}).addTo(map);

var markers= []

for (let i = 0; i < markersData.length; i++) {
    var myIcon = L.icon({
        iconUrl: markersData[i].photo,
        iconSize: [20,],
        iconAnchor: [10, 20],
    });

    markers.push({
        marker: L.marker([markersData[i].lat, markersData[i].lon], { icon: myIcon,title: markersData[i].name }).addTo(map),
        name: markersData[i].name
    });
}
for (let i = 0; i < markers.length; i++) {
    markers[i].marker.on('click', function() {
        var newStr = window.location.href.slice(0, window.location.href.length-3);
        window.location.replace(newStr+markers[i].name);

    })
}
