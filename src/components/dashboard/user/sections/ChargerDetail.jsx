import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { FiMessageCircle, FiUser, FiMail } from "react-icons/fi";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import api from "../../../../services/api";
import BookCharger from "./BookCharger";
import ChargerRatingSummary from "../../../rating/ChargerRatingSummary.jsx";
import ReviewsList from "../../../rating/ReviewsList.jsx";
import "../../../../css/chargerDetail.css";

/* ✅ FIX: Import leaflet marker images (Vite-compatible) */
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

/* ✅ FIX: Leaflet default icon setup */
delete L.Icon.Default.prototype._getIconUrl;

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
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
  const [initiatingChat, setInitiatingChat] = useState(false);

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

  const handleContactHost = async () => {
    if (!charger || !charger.hostId) {
      console.error("❌ No host information available");
      return;
    }

    setInitiatingChat(true);

    try {
      navigate("/user-dashboard", {
        state: {
          navigateTo: "chat",
          hostId: charger.hostId,
          hostEmail: charger.hostEmail,
          chargerId: charger.id,
          chargerName: charger.name
        }
      });
    } catch (err) {
      console.error("❌ Error initiating chat:", err);
      setError("Failed to start conversation. Please try again.");
    } finally {
      setInitiatingChat(false);
    }
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
                src={
                  charger.images[selectedImage].startsWith("http")
                    ? charger.images[selectedImage]
                    : `${BACKEND_URL}${charger.images[selectedImage]}`
                }
                alt={`${charger.name} - Image ${selectedImage + 1}`}
                className="main-image"
                onError={(e) => {
                  e.target.src =
                    "/no-image.svg";
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
                    src={img.startsWith("http") ? img : `${BACKEND_URL}${img}`}
                    alt={`Thumbnail ${idx + 1}`}
                    className={`thumbnail ${
                      selectedImage === idx ? "active" : ""
                    }`}
                    onClick={() => setSelectedImage(idx)}
                    onError={(e) => {
                      e.target.src =
                        "/no-image.svg";
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
          {/* Host Contact Card */}
          <div className="info-card host-contact-card">
            <h3>Host Information</h3>
            <div className="host-info">
              <div className="host-details">
                <div className="host-avatar">
                  <FiUser size={24} />
                </div>
                <div className="host-text">
                  <p className="host-name">
                    {charger.hostName || charger.hostEmail?.split('@')[0] || 'Host'}
                  </p>
                  <p className="host-email">
                    <FiMail size={14} /> {charger.hostEmail}
                  </p>
                </div>
              </div>
              <button 
                className="contact-host-btn"
                onClick={handleContactHost}
                disabled={initiatingChat}
              >
                <FiMessageCircle size={18} />
                {initiatingChat ? 'Opening Chat...' : 'Contact Host'}
              </button>
            </div>
            <p className="contact-hint">
              💬 Have questions? Message the host directly about availability, pricing, or charger details.
            </p>
          </div>

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
                <span className="info-label">Status</span>
                <span className="info-value status-available">
                  ✓ Available
                </span>
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

          {/* Action Buttons */}
          <div className="action-buttons-container">
            <button
              className="book-now-btn primary"
              onClick={() => setShowBookingModal(true)}
            >
              ⚡ Book This Charger
            </button>
            <button
              className="contact-host-btn-secondary"
              onClick={handleContactHost}
              disabled={initiatingChat}
            >
              <FiMessageCircle size={18} />
              Ask a Question
            </button>
          </div>
        </div>
      </div>

      {/* Rating Summary Section */}
      <div className="charger-ratings-section">
        <h3>⭐ Ratings & Reviews</h3>
        <ChargerRatingSummary chargerId={charger.id} />
      </div>

      {/* Reviews List Section */}
      <div className="charger-reviews-section">
        <ReviewsList chargerId={charger.id} />
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
