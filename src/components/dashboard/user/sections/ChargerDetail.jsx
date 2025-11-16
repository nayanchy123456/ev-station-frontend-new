import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../../services/api";
import "../../../../css/chargerDetail.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const chargerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/808/808569.png",
  iconSize: [40, 40],
});

const BACKEND_URL = "http://localhost:8080";

const ChargerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [charger, setCharger] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChargerDetail = async () => {
      try {
        const res = await api.get(`/chargers/${id}`);
        setCharger(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChargerDetail();
  }, [id]);

  const getImageUrl = (imgPath) => {
    if (!imgPath) return "https://via.placeholder.com/400x250?text=No+Image";
    if (imgPath.startsWith("http")) return imgPath;
    if (imgPath.startsWith("/")) return `${BACKEND_URL}${imgPath}`;
    return `${BACKEND_URL}/${imgPath}`;
  };

  if (loading) return <p className="status-message">Loading charger details...</p>;
  if (!charger) return <p className="status-message">Charger not found.</p>;

  return (
    <div className="charger-detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <h2>{charger.name}</h2>
      <p className="location">{charger.location}</p>

      <div className="charger-detail-content">
        <div className="charger-images">
          {charger.images?.length > 0 ? (
            charger.images.map((img, i) => (
              <img key={i} src={getImageUrl(img)} alt={`Charger ${i}`} />
            ))
          ) : (
            <img
              src="https://via.placeholder.com/400x250?text=No+Image"
              alt="No Charger"
            />
          )}
        </div>

        <div className="charger-info">
          <h3>Charger Details</h3>
          <p>
            <strong>Brand:</strong> {charger.brand}
          </p>
          <p>
            <strong>Price per kWh:</strong> Rs {charger.pricePerKwh}
          </p>
          <p>
            <strong>Host:</strong> {charger.hostEmail || "Community Host"}
          </p>
          {charger.latitude && charger.longitude && (
            <p>
              <strong>Coordinates:</strong> {charger.latitude}, {charger.longitude}
            </p>
          )}
          <button className="book-btn">Book Charger</button>
        </div>
      </div>

      {charger.latitude && charger.longitude && (
        <div className="charger-map">
          <MapContainer
            center={[charger.latitude, charger.longitude]}
            zoom={14}
            scrollWheelZoom={true}
            className="map"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker
              position={[charger.latitude, charger.longitude]}
              icon={chargerIcon}
            >
              <Popup>{charger.name}</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default ChargerDetail;
