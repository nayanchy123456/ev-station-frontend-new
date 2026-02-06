import React, { useEffect, useState, useCallback, useRef } from "react";
import bookingService from "../../../../services/bookingService.js";
import PaymentTimer from "../../../dashboard/user/sections/PaymentTimer";
import "../../../../css/bookings/hostBookings.css";

const HostBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  // Track if user is interacting with the page
  const [isInteracting, setIsInteracting] = useState(false);
  const interactionTimerRef = useRef(null);

  // Fetch bookings function with useCallback
  const fetchBookings = useCallback(async () => {
    try {
      setError("");
      const data = await bookingService.getBookingsByHost();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching host bookings:", err);
      setError(err.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Smart auto-refresh: only refresh when user is not actively interacting
  useEffect(() => {
    // Refresh every 60 seconds (reduced from 30 seconds for better UX)
    const refreshInterval = setInterval(() => {
      // Only refresh if user hasn't interacted in the last 10 seconds
      if (!isInteracting) {
        fetchBookings();
      }
    }, 60000); // 60 seconds

    return () => clearInterval(refreshInterval);
  }, [fetchBookings, isInteracting]);

  // Track user interactions to prevent refresh during active use
  useEffect(() => {
    const handleUserInteraction = () => {
      setIsInteracting(true);
      
      // Clear existing timer
      if (interactionTimerRef.current) {
        clearTimeout(interactionTimerRef.current);
      }

      // Set user as not interacting after 10 seconds of inactivity
      interactionTimerRef.current = setTimeout(() => {
        setIsInteracting(false);
      }, 10000);
    };

    // Listen for user interactions
    window.addEventListener('mousemove', handleUserInteraction);
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('keypress', handleUserInteraction);
    window.addEventListener('scroll', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);

    return () => {
      window.removeEventListener('mousemove', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keypress', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      
      if (interactionTimerRef.current) {
        clearTimeout(interactionTimerRef.current);
      }
    };
  }, []);

  const handleManualRefresh = async () => {
    setLoading(true);
    await fetchBookings();
  };

  // Filter bookings
  const getFilteredBookings = () => {
    if (filter === "ALL") return bookings;
    return bookings.filter((b) => b.status === filter);
  };

  // Get status count
  const getStatusCount = (status) => {
    if (status === "ALL") return bookings.length;
    return bookings.filter((b) => b.status === status).length;
  };

  // Calculate stats
  const reservedBookings = bookings.filter(b => b.status === "RESERVED" || b.status === "PAYMENT_PENDING");
  const upcomingBookings = bookings.filter(
    (b) => b.status === "CONFIRMED" && new Date(b.startTime) > new Date()
  );
  const activeBookings = bookings.filter((b) => b.status === "ACTIVE");
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED");
  const totalRevenue = completedBookings.reduce(
    (sum, b) => sum + (parseFloat(b.totalPrice) || 0),
    0
  );

  const filteredBookings = getFilteredBookings();

  // Format date/time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate duration
  const calculateDuration = (start, end) => {
    const duration = bookingService.calculateDuration(start, end);
    return bookingService.formatDuration(duration);
  };

  return (
    <div className="host-bookings-container">
      {/* Header */}
      <div className="bookings-header">
        <div className="header-content">
          <h2>🔌 My Charger Bookings</h2>
          <p className="header-subtitle">
            Monitor and manage bookings for your charging stations
          </p>
        </div>
        <button className="refresh-btn" onClick={handleManualRefresh} disabled={loading}>
          <span className="refresh-icon">🔄</span>
          Refresh
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <span>❌</span>
          <p>{error}</p>
        </div>
      )}

      {/* Statistics Cards */}
      {!loading && bookings.length > 0 && (
        <div className="booking-stats">
          <div className="stat-card pending">
            <span className="stat-icon">⏳</span>
            <div className="stat-content">
              <span className="stat-value">{reservedBookings.length}</span>
              <span className="stat-label">Pending Payment</span>
            </div>
          </div>
          <div className="stat-card upcoming">
            <span className="stat-icon">📅</span>
            <div className="stat-content">
              <span className="stat-value">{upcomingBookings.length}</span>
              <span className="stat-label">Confirmed</span>
            </div>
          </div>
          <div className="stat-card active">
            <span className="stat-icon">⚡</span>
            <div className="stat-content">
              <span className="stat-value">{activeBookings.length}</span>
              <span className="stat-label">Active Now</span>
            </div>
          </div>
          <div className="stat-card completed">
            <span className="stat-icon">✓</span>
            <div className="stat-content">
              <span className="stat-value">{completedBookings.length}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
          <div className="stat-card revenue">
            <span className="stat-icon">💰</span>
            <div className="stat-content">
              <span className="stat-value">
                NPR {totalRevenue.toFixed(2)}
              </span>
              <span className="stat-label">Total Revenue</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {["ALL", "RESERVED", "PAYMENT_PENDING", "CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED", "EXPIRED"].map(
          (status) => (
            <button
              key={status}
              className={`filter-tab ${filter === status ? "active" : ""} ${bookingService.getStatusBadgeClass(status)}`}
              onClick={() => setFilter(status)}
            >
              <span className="filter-label">
                {bookingService.getStatusDisplayText(status)}
              </span>
              <span className="filter-count">{getStatusCount(status)}</span>
            </button>
          )
        )}
      </div>

      {/* Bookings List */}
      <div className="bookings-list">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading bookings...</p>
          </div>
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <BookingCard 
              key={booking.bookingId} 
              booking={booking}
              onRefresh={fetchBookings}
            />
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>
              No {filter !== "ALL" && bookingService.getStatusDisplayText(filter).toLowerCase()} bookings found
            </h3>
            <p>
              {filter === "ALL"
                ? "No one has booked your chargers yet. Make sure your chargers are listed and visible to users!"
                : `You don't have any ${bookingService.getStatusDisplayText(filter).toLowerCase()} bookings at the moment.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ⭐ UPDATED BookingCard Component with Rating Display
const BookingCard = ({ booking, onRefresh }) => {
  const statusColor = bookingService.getStatusColor(booking.status);
  const needsPayment = booking.status === "RESERVED" || booking.status === "PAYMENT_PENDING";
  const isExpired = booking.status === "EXPIRED";
  const hasRating = booking.ratingId && booking.ratingScore; // ⭐ NEW

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDuration = (start, end) => {
    const duration = bookingService.calculateDuration(start, end);
    return bookingService.formatDuration(duration);
  };

  // ⭐ NEW - Function to render star rating
  const renderStarRating = (score) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= score ? "star filled" : "star empty"}>
          ⭐
        </span>
      );
    }
    return stars;
  };

  return (
    <div className={`booking-card ${needsPayment ? 'needs-payment' : ''} ${isExpired ? 'expired-card' : ''}`}>
      {/* Timer for RESERVED/PAYMENT_PENDING bookings */}
      {needsPayment && booking.reservedUntil && !isExpired && (
        <div className="card-timer-section">
          <PaymentTimer 
            reservedUntil={booking.reservedUntil}
            onExpire={onRefresh}
            showWarning={false}
          />
          <div className="payment-status-info">
            <span className="info-icon">⏳</span>
            <p>Awaiting customer payment</p>
          </div>
        </div>
      )}

      {/* Card Header */}
      <div className="booking-card-header">
        <div className="charger-info">
          <h3>
            <span className="charger-icon">🔌</span>
            {booking.chargerName}
          </h3>
          <span className="booking-id">Booking #{booking.bookingId}</span>
        </div>
        <span
          className={`status-badge ${booking.status.toLowerCase()}`}
          style={{
            backgroundColor: statusColor,
          }}
        >
          {bookingService.getStatusDisplayText(booking.status)}
        </span>
      </div>

      {/* Card Body */}
      <div className="booking-card-body">
        <div className="booking-detail">
          <span className="detail-icon">👤</span>
          <div className="detail-content">
            <span className="detail-label">Customer ID</span>
            <span className="detail-value">#{booking.userId}</span>
          </div>
        </div>

        <div className="booking-detail">
          <span className="detail-icon">📅</span>
          <div className="detail-content">
            <span className="detail-label">Start Time</span>
            <span className="detail-value">
              {formatDateTime(booking.startTime)}
            </span>
          </div>
        </div>

        <div className="booking-detail">
          <span className="detail-icon">🏁</span>
          <div className="detail-content">
            <span className="detail-label">End Time</span>
            <span className="detail-value">
              {formatDateTime(booking.endTime)}
            </span>
          </div>
        </div>

        <div className="booking-detail">
          <span className="detail-icon">⏱️</span>
          <div className="detail-content">
            <span className="detail-label">Duration</span>
            <span className="detail-value">
              {calculateDuration(booking.startTime, booking.endTime)}
            </span>
          </div>
        </div>

        <div className="booking-detail">
          <span className="detail-icon">⚡</span>
          <div className="detail-content">
            <span className="detail-label">Price Rate</span>
            <span className="detail-value">
              NPR {booking.pricePerKwh}/kWh
            </span>
          </div>
        </div>

        {booking.totalPrice && (
          <div className="booking-detail highlight">
            <span className="detail-icon">💰</span>
            <div className="detail-content">
              <span className="detail-label">Total Amount</span>
              <span className="detail-value total-price">
                NPR {parseFloat(booking.totalPrice).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* ⭐ NEW - Rating Display Section */}
        {hasRating && (
          <div className="rating-display-section">
            <div className="rating-header">
              <span className="rating-icon">⭐</span>
              <span className="rating-title">Customer Rating</span>
            </div>
            <div className="rating-content">
              <div className="rating-stars">
                {renderStarRating(booking.ratingScore)}
                <span className="rating-score">{booking.ratingScore}/5</span>
              </div>
              {booking.ratingComment && (
                <div className="rating-comment">
                  <p>"{booking.ratingComment}"</p>
                </div>
              )}
              <div className="rating-timestamp">
                Rated on {formatDateTime(booking.ratingCreatedAt)}
              </div>
            </div>
          </div>
        )}

        {/* Status-specific indicators */}
        {booking.status === "ACTIVE" && (
          <div className="active-indicator">
            <span className="pulse-dot"></span>
            <span>Charging in progress...</span>
          </div>
        )}

        {booking.status === "CONFIRMED" && (
          <div className="upcoming-indicator">
            <span>⏰</span>
            <span>
              {bookingService.getTimeUntilStart(booking.startTime)}
            </span>
          </div>
        )}

        {isExpired && (
          <div className="expired-indicator">
            <span className="expired-icon">⏰</span>
            <p>This reservation expired - customer did not complete payment in time</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostBookings;