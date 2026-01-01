import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import api from "../../../../services/api";
import BookCharger from "./BookCharger";
import "../../../../css/chargerDetail.css";

/* ✅ FIX: Import leaflet marker images (Vite-compatible) */
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

/* ✅ FIX: Leaflet default icon setup */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const ChargerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [charger, setCharger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchChargerDetails();
  }, [id]);

  const fetchChargerDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(`/chargers/${id}`);
      setCharger(response.data);
    } catch (err) {
      console.error("Error fetching charger:", err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to load charger details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    navigate("/user-dashboard");

    setTimeout(() => {
      const event = new CustomEvent("setActiveSection", {
        detail: "bookings",
      });
      window.dispatchEvent(event);
    }, 100);
  };

  if (loading) {
    return (
      <div className="charger-detail-loading">
        <div className="spinner"></div>
        <p>Loading charger details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="charger-detail-error">
        <p className="error-message">⚠️ {error}</p>
        <button onClick={() => navigate(-1)} className="back-btn">
          Go Back
        </button>
      </div>
    );
  }

  if (!charger) return null;

  const hasImages = charger.images && charger.images.length > 0;
  const hasLocation = charger.latitude && charger.longitude;

  return (
    <div className="charger-detail-container">
      {/* Header */}
      <div className="charger-detail-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back
        </button>
        <h2>{charger.name}</h2>
        <p className="location">📍 {charger.location}</p>
      </div>

      {/* Main Content */}
      <div className="charger-detail-content">
        {/* Image Gallery */}
        {hasImages ? (
          <div className="charger-gallery-section">
            <div className="main-image-container">
              <img
                src={`http://localhost:8080${charger.images[selectedImage]}`}
                alt={`${charger.name} - Image ${selectedImage + 1}`}
                className="main-image"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/600x400?text=No+Image";
                }}
              />
              <div className="image-counter">
                {selectedImage + 1} / {charger.images.length}
              </div>
            </div>

            {charger.images.length > 1 && (
              <div className="thumbnail-gallery">
                {charger.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={`http://localhost:8080${img}`}
                    alt={`Thumbnail ${idx + 1}`}
                    className={`thumbnail ${
                      selectedImage === idx ? "active" : ""
                    }`}
                    onClick={() => setSelectedImage(idx)}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/100x100?text=No+Image";
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="no-images-placeholder">
            <div className="placeholder-icon">🔌</div>
            <p>No images available</p>
          </div>
        )}

        {/* Charger Info */}
        <div className="charger-info-section">
          <div className="info-card">
            <h3>Charger Details</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Brand</span>
                <span className="info-value">{charger.brand}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Price per kWh</span>
                <span className="info-value price">
                  Rs {charger.pricePerKwh}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Rating</span>
                <span className="info-value">
                  ⭐ {charger.rating.toFixed(1)}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Host</span>
                <span className="info-value">{charger.hostEmail}</span>
              </div>
            </div>
          </div>

          <div className="pricing-estimate">
            <h4>💰 Estimated Charging Cost</h4>
            <div className="estimate-grid">
              <div className="estimate-item">
                <span>1 hour</span>
                <strong>Rs {(charger.pricePerKwh * 7).toFixed(2)}</strong>
              </div>
              <div className="estimate-item">
                <span>2 hours</span>
                <strong>Rs {(charger.pricePerKwh * 14).toFixed(2)}</strong>
              </div>
              <div className="estimate-item">
                <span>4 hours</span>
                <strong>Rs {(charger.pricePerKwh * 28).toFixed(2)}</strong>
              </div>
            </div>
            <p className="estimate-note">
              * Based on average 7 kW charging rate
            </p>
          </div>

          <button
            className="book-now-btn"
            onClick={() => setShowBookingModal(true)}
          >
            ⚡ Book This Charger
          </button>
        </div>
      </div>

      {/* Map */}
      {hasLocation && (
        <div className="charger-map-section">
          <h3>📍 Charger Location</h3>
          <div className="charger-map">
            <MapContainer
              center={[charger.latitude, charger.longitude]}
              zoom={15}
              className="map"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              <Marker position={[charger.latitude, charger.longitude]}>
                <Popup>
                  <strong>{charger.name}</strong>
                  <br />
                  {charger.location}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <BookCharger
          charger={charger}
          onBookingSuccess={handleBookingSuccess}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </div>
  );
};

export default ChargerDetail;
