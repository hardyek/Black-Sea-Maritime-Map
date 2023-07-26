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
        const color = returnColor(type);
        const iconFileName = returnIconImg(status);

        // Create the icon HTML
        const iconHtml = '<img src="' + Imgs[iconFileName] + '" width="24" height="24" ' +
            'style="transform: rotate(' + cog + 'deg); filter: brightness(120%) ' +
            'drop-shadow(0px 0px 2px ' + color + ');"/>';

        return L.divIcon({
            className: 'custom-ship-icon',
            html: iconHtml,
            iconSize: [24, 24],
        });
    }

    function returnColor(type) {
        const Colors = {
            special: "#000000",
            military: "#ff0000",
            tug: "#939393",
            fishing: "#00fcff",
            passenger: "#f20bdb",
            cargo: "#08ff00",
            tanker: "#fff600",
        };

        const Ranges = {
            military: [29, 35, 55, 51, 58],
            tug: [31, 32, 50, 52, 53],
            fishing: [30],
            passenger: [60, 69],
            cargo: [70, 79],
            tanker: [80, 89],
        };
        
        for (const category in Ranges) {
            if (Ranges[category].includes(number)) {
              return Colors[category];
            }
        }

        return Colors["special"]
    };

    function returnIconImg(status){
        const Imgs = {
            0: 'doubleup.svg',
            1: 'anchor.svg',
            5: 'anchor.svg',
            7: 'fishing.svg',
            8: 'sail.svg',
            6: 'danger.svg'
        }

        const icon = Imgs[status] || 'singleup.svg';

        return icon;
    };
});
