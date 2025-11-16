import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../../../../css/chargerList.css";

// Green marker for normal chargers
const greenIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -28],
  shadowUrl: null,
});

// Red marker for selected charger
const redIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -28],
  shadowUrl: null,
});

// Component to center map when selectedCharger changes
const MapCenter = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 14, { animate: true });
    }
  }, [position, map]);
  return null;
};

const ChargerMap = ({ chargers, selectedCharger }) => {
  const defaultPosition = [27.7172, 85.324]; // Kathmandu

  const getMarkerIcon = (charger) => {
    return selectedCharger && charger.id === selectedCharger.id ? redIcon : greenIcon;
  };

  return (
    <div className="charger-map-container">
      <MapContainer
        center={defaultPosition}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: "500px", width: "100%", borderRadius: "16px" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {chargers
          .filter((c) => c.latitude != null && c.longitude != null)
          .map((c) => (
            <Marker
              key={c.id}
              position={[c.latitude, c.longitude]}
              icon={getMarkerIcon(c)}
            >
              <Popup>
                <strong>{c.name}</strong>
                <br />
                Brand: {c.brand}
                <br />
                Price: Rs {c.pricePerKwh}/kWh
                <br />
                Host: {c.hostEmail || "N/A"}
                <br />
                Rating: ⭐ {c.rating?.toFixed(1) || "0.0"}
              </Popup>
            </Marker>
          ))}

        {/* Center map on selected charger */}
        {selectedCharger && selectedCharger.latitude && selectedCharger.longitude && (
          <MapCenter position={[selectedCharger.latitude, selectedCharger.longitude]} />
        )}
      </MapContainer>
    </div>
  );
};

export default ChargerMap;
