import React from "react";
import { useNavigate } from "react-router-dom";
import "../../../../css/bookings/bookingCard.css";

const BookingCard = ({ booking, onCancel, isCancelling }) => {
  const navigate = useNavigate();

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const options = {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    };
    return date.toLocaleString("en-US", options);
  };

  const formatDateShort = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatTimeOnly = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const calculateDuration = () => {
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    const minutes = (end - start) / (1000 * 60);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  const canCancel = () => {
    const now = new Date();
    const startTime = new Date(booking.startTime);
    const hourBefore = new Date(startTime.getTime() - 60 * 60 * 1000);
    return booking.status === "CONFIRMED" && now < hourBefore;
  };

  const getTimeUntilStart = () => {
    const now = new Date();
    const start = new Date(booking.startTime);
    const diff = start - now;
    
    if (diff < 0) return "Started";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `In ${days}d ${hours % 24}h`;
    if (hours > 0) return `In ${hours}h ${minutes}m`;
    return `In ${minutes}m`;
  };

  const getStatusConfig = () => {
    const configs = {
      CONFIRMED: {
        icon: "✓",
        label: "Confirmed",
        color: "#10b981"
      },
      ACTIVE: {
        icon: "⚡",
        label: "Active",
        color: "#3b82f6"
      },
      COMPLETED: {
        icon: "✓",
        label: "Completed",
        color: "#64748b"
      },
      CANCELLED: {
        icon: "✖",
        label: "Cancelled",
        color: "#ef4444"
      }
    };
    return configs[booking.status] || configs.CONFIRMED;
  };

  const statusConfig = getStatusConfig();

  return (
    <div className={`booking-card ${booking.status.toLowerCase()}`}>
      {/* Status Badge */}
      <div 
        className="status-badge"
        style={{ 
          backgroundColor: `${statusConfig.color}20`,
          color: statusConfig.color,
          borderColor: `${statusConfig.color}40`
        }}
      >
        <span className="status-icon">{statusConfig.icon}</span>
        <span className="status-text">{statusConfig.label}</span>
      </div>

      {/* Booking Header */}
      <div className="booking-header">
        <div className="charger-info-section">
          <h3 className="charger-name">{booking.chargerName}</h3>
          <p className="booking-id">Booking #{booking.bookingId}</p>
        </div>
        
        {booking.status === "CONFIRMED" && (
          <div className="time-until">
            <span className="countdown-label">Starts</span>
            <span className="countdown-value">{getTimeUntilStart()}</span>
          </div>
        )}
      </div>

      {/* Booking Details Grid */}
      <div className="booking-details-grid">
        <div className="detail-item">
          <span className="detail-icon">📅</span>
          <div className="detail-content">
            <span className="detail-label">Date</span>
            <span className="detail-value">{formatDateShort(booking.startTime)}</span>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon">🕐</span>
          <div className="detail-content">
            <span className="detail-label">Time</span>
            <span className="detail-value">
              {formatTimeOnly(booking.startTime)} - {formatTimeOnly(booking.endTime)}
            </span>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon">⏱️</span>
          <div className="detail-content">
            <span className="detail-label">Duration</span>
            <span className="detail-value">{calculateDuration()}</span>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon">💰</span>
          <div className="detail-content">
            <span className="detail-label">Rate</span>
            <span className="detail-value">Rs {booking.pricePerKwh}/kWh</span>
          </div>
        </div>
      </div>

      {/* Total Price (if available) */}
      {booking.totalPrice && (
        <div className="total-price-section">
          <span className="total-label">Total Cost</span>
          <span className="total-value">Rs {booking.totalPrice}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="booking-actions">
        <button
          className="action-btn view-btn"
          onClick={() => navigate(`/user-dashboard/charger/${booking.chargerId}`)}
        >
          <span>📍</span>
          View Charger
        </button>

        {canCancel() && (
          <button
            className="action-btn cancel-btn"
            onClick={() => onCancel(booking.bookingId)}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <>
                <span className="btn-spinner"></span>
                Cancelling...
              </>
            ) : (
              <>
                <span>✖</span>
                Cancel
              </>
            )}
          </button>
        )}
      </div>

      {/* Cancel Warning */}
      {canCancel() && (
        <div className="cancel-warning">
          <span className="warning-icon">⚠️</span>
          <span className="warning-text">
            Can cancel until {formatTimeOnly(new Date(new Date(booking.startTime).getTime() - 60 * 60 * 1000))}
          </span>
        </div>
      )}
    </div>
  );
};

export default BookingCard;