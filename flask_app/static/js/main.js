document.addEventListener('DOMContentLoaded', function () {
    var map = L.map('map').setView([43.926723, 34.248584], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var vesselMarkers = {};

    function updateMap() {
        fetch('/get_vessel_data')
            .then(response => response.json())
            .then(data => {
                data.forEach(vessel => {
                    var id = vessel.id;
                    var name = vessel.name;
                    var imo = vessel.imo;
                    var type = vessel.type;
                    var lat = vessel.lat;
                    var lng = vessel.long;
                    var status = vessel.status;
                    var cog = vessel.cog;
                    var sog = vessel.sog;
                    var timestamp = vessel.timestamp;

                    if (vesselMarkers[id]) {
                        // Check if the marker already exists and update its position
                        vesselMarkers[id].setLatLng([lat, lng]);

                        // Update the marker icon with the new rotation angle
                        var markerOptions = { icon: createShipIcon(cog) };
                        vesselMarkers[id].setIcon(markerOptions.icon);
                    } else {
                        // Create a new marker if it doesn't exist
                        vesselMarkers[id] = L.marker([lat, lng], { icon: createShipIcon(cog) }).addTo(map);
                    }
                });
            })
            .catch(error => console.error('Error:', error));

        // Schedule the next update in 5 seconds
        setTimeout(updateMap, 5000);
    }

    // Initial map update
    updateMap();

    function createShipIcon(id,name,imo,type,lat,lng,status,cog,sog,timestamp) {
        var iconHtml = '';

        iconHtml = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" ' +
                    'style="transform: rotate(' + cog + 'deg);">' +
                    '<path fill="blue" d="M12 2L2 22h20L12 2zm0 16h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V8h2v2z"/>' +
                    '</svg>';


        return L.divIcon({
            className: 'custom-ship-icon',
            html: iconHtml,
            iconSize: [24, 24],
        });
    }
});
