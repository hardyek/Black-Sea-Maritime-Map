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
                    var vessellength = vessel.vessellength;
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
                        var markerOptions = { icon: createShipIcon(type,status,cog) };
                        vesselMarkers[id].setIcon(markerOptions.icon);
                    } else {
                        // Create a new marker if it doesn't exist
                        vesselMarkers[id] = L.marker([lat, lng], { icon: createShipIcon(type,status,cog) }).addTo(map);
                    }

                    const popupContent = '<b>' + name + '</b> @ ' + sog + 'kn/' + cog + '°<br>' +
                        returnTypeInfo(type) +' | '+ vessellength + 'm - <i>'+ returnNavInfo(status) + '</i> <br>' +
                        timestamp + '<br>' +
                        '<b> MMSI: </b>' + id + ',<b>IMO:</b> ' + imo + '<br>';
                    vesselMarkers[id].bindPopup(popupContent);
                });
            })
            .catch(error => console.error('Error:', error));

        // Schedule the next update in 5 seconds
        setTimeout(updateMap, 5000);
    }

    // Initial map update
    updateMap();

    function createShipIcon(type,status,cog) {
        const color = returnColor(type);
        const iconFileName = returnIconImg(status);

        // Create the icon HTML
        const iconHtml = '<img src="' + iconFileName + '" width="12" height="12" ' +
            'style="transform: rotate(' + cog + 'deg); filter: brightness(120%) ' +
            'drop-shadow(1px 1px 2px ' + color + ');"/>';

        return L.divIcon({
            className: 'custom-ship-icon',
            html: iconHtml,
            iconSize: [12, 12],
        });
    }

    function returnColor(type) {
        const Colors = {
            special: "#ffffff",
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
            if (Ranges[category].includes(type)) {
              return Colors[category];
            }
        }

        return Colors["special"]
    };

    function returnIconImg(status){
        const Imgs = {
            0: svgUrls.doubleup,
            1: svgUrls.anchor,
            5: svgUrls.anchor,
            7: svgUrls.fishing,
            8: svgUrls.sail,
            6: svgUrls.danger
        }

        const icon = Imgs[status] || svgUrls.singleup;

        return icon;
    };

    function returnTypeInfo(type) {
        const List = ["Unavailable",
        "Unavailable",
        "Unavailable",
        "Unavailable",
        "Unavailable",
        "Unavailable",
        "Unavailable",
        "Unavailable",
        "Unavailable",
        "Unavailable",
        "Reserved",
        "Reserved",
        "Reserved",
        "Reserved",
        "Reserved",
        "Reserved",
        "Reserved",
        "Reserved",
        "Reserved",
        "Reserved",
        "Wing in Ground Effect Vessel",
        "Wing in Ground Effect Vessel",
        "Wing in Ground Effect Vessel",
        "Wing in Ground Effect Vessel",
        "Wing in Ground Effect Vessel",
        "Wing in Ground Effect Vessel",
        "Wing in Ground Effect Vessel",
        "Wing in Ground Effect Vessel",
        "Wing in Ground Effect Vessel",
        "SAR Aircraft",
        "Fishing Vessel",
        "Tug",
        "Tug",
        "Dredger",
        "Dive Vessel",
        "Military Ops",
        "Sailing Vessel",
        "Pleasure Vessel",
        "Reserved",
        "Reserved",
        "High Speed Vessel",
        "High Speed Vessel",
        "High Speed Vessel",
        "High Speed Vessel",
        "High Speed Vessel",
        "High Speed Vessel",
        "High Speed Vessel",
        "High Speed Vessel",
        "High Speed Vessel",
        "High Speed Vessel",
        "Pilot Vessel",
        "SAR Vessel",
        "Tug (Special)",
        "Port Tender",
        "Anti-Pollution Vessel",
        "Law Enforcement Vessel",
        "Local Vessel",
        "Local Vessel",
        "Medical Transport Vessel",
        "Special Vessel",
        "Passenger",
        "Passenger",
        "Passenger",
        "Passenger",
        "Passenger",
        "Passenger",
        "Passenger",
        "Passenger",
        "Passenger",
        "Passenger",
        "Cargo",
        "Cargo - Hazard A (Major)",
        "Cargo - Hazard B",
        "Cargo - Hazard C (Minor)",
        "Cargo - Hazard D (Recognisable)",
        "Cargo",
        "Cargo",
        "Cargo",
        "Cargo",
        "Cargo",
        "Tanker",
        "Tanker - Hazard A (Major)",
        "Tanker - Hazard B",
        "Tanker - Hazard C (Minor)",
        "Tanker - Hazard D (Recognisable)",
        "Tanker",
        "Tanker",
        "Tanker",
        "Tanker",
        "Tanker",
        "Other",
        "Other",
        "Other",
        "Other",
        "Other",
        "Other",
        "Other",
        "Other",
        "Other",
        "Other"]

        return List[type];
    }

    function returnNavInfo(status){
        const List = ["Under way using engine",
        "At anchor",
        "Not under command",
        "Restricted manoeuverability",
        "Constrained by her draught",
        "Moored",
        "Aground",
        "Engaged in Fishing",
        "Under way sailing",
        "Reserved for future amendment of Navigational Status for HSC",
        "Reserved for future amendment of Navigational Status for WIG",
        "Reserved for future use",
        "Reserved for future use",
        "Reserved for future use",
        "AIS-SART is active",
        "Not defined"]

        return List[status];
    }
});
