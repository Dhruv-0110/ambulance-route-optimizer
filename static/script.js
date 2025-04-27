document.addEventListener('DOMContentLoaded', function () {
  const map = L.map('map').setView([30.3165, 78.0322], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  let hospitals = {};
  let userCoords = null;
  let routeControl = null;

  function toRad(deg) {
    return deg * Math.PI / 180;
  }

  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function showRoute(fromLatLng, toLatLng) {
    if (routeControl) {
      map.removeControl(routeControl);
    }
    routeControl = L.Routing.control({
      waypoints: [L.latLng(fromLatLng), L.latLng(toLatLng)],
      routeWhileDragging: false,
      showAlternatives: false,
      addWaypoints: false,
      lineOptions: {
        styles: [
          { color: 'blue', weight: 5, opacity: 0.7 }  // Set route color to blue
        ]
      }
    }).addTo(map);
  }
  
  fetch('/hospitals')
    .then(response => response.json())
    .then(data => {
      hospitals = data;

      Object.entries(hospitals).forEach(([name, coords]) => {
        const [lat, lon] = coords;
        L.marker([lat, lon]).addTo(map).bindPopup(`<b>${name}</b>`);
      });
    })
    .catch(error => {
      console.error('Error loading hospital data:', error);
    });

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      position => {
        userCoords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };

        map.setView([userCoords.lat, userCoords.lon], 14);

        L.marker([userCoords.lat, userCoords.lon], {
          icon: L.icon({
            iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -30]
          })
        }).addTo(map).bindPopup("<b>You are here</b>").openPopup();
      },
      error => {
        console.error("Geolocation error:", error);
        alert("Geolocation failed. Please allow location access.");
      }
    );
  }

  // Nearest hospital button logic
  document.querySelector('.findRouteBtn').addEventListener('click', () => {
    if (!userCoords || Object.keys(hospitals).length === 0) {
      alert("Waiting for location or hospital data.");
      return;
    }

    let nearest = null;
    let minDist = Infinity;

    for (const [name, [lat, lon]] of Object.entries(hospitals)) {
      const dist = haversine(userCoords.lat, userCoords.lon, lat, lon);
      if (dist < minDist) {
        minDist = dist;
        nearest = { name, lat, lon };
      }
    }

    if (nearest) {
      showRoute([userCoords.lat, userCoords.lon], [nearest.lat, nearest.lon]);
    }
  });

  // Route to selected hospital from dropdown
  document.querySelector('.routeToSelectedBtn').addEventListener('click', () => {
    const select = document.getElementById('hospital-select');
    const selectedName = select.value;

    if (!selectedName) {
      alert("Please select a hospital from the dropdown.");
      return;
    }

    if (!userCoords) {
      alert("User location not available yet.");
      return;
    }

    const coords = hospitals[selectedName];
    if (!coords) {
      alert("Coordinates for selected hospital not found.");
      return;
    }

    showRoute([userCoords.lat, userCoords.lon], coords);
  });
});
