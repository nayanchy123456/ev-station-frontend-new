import React, { useEffect, useState } from "react";
import bookingService from "../../../../services/bookingService.js";
import "../../../../css/bookings/hostBookings.css";

const HostBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await bookingService.getBookingsByHost();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching host bookings:", err);
      setError(err.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
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
        <button className="refresh-btn" onClick={fetchBookings}>
          🔄 Refresh
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
          <div className="stat-card">
            <span className="stat-icon">📅</span>
            <div className="stat-content">
              <span className="stat-value">{upcomingBookings.length}</span>
              <span className="stat-label">Upcoming</span>
            </div>
          </div>
          <div className="stat-card active">
            <span className="stat-icon">⚡</span>
            <div className="stat-content">
              <span className="stat-value">{activeBookings.length}</span>
              <span className="stat-label">Active Now</span>
            </div>
          </div>
          <div className="stat-card">
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
                Rs {totalRevenue.toFixed(2)}
              </span>
              <span className="stat-label">Total Revenue</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {["ALL", "CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED"].map(
          (status) => (
            <button
              key={status}
              className={`filter-tab ${filter === status ? "active" : ""}`}
              onClick={() => setFilter(status)}
            >
              <span className="filter-label">{status}</span>
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
            <div key={booking.bookingId} className="booking-card">
              {/* Card Header */}
              <div className="booking-card-header">
                <div className="charger-info">
                  <h3>{booking.chargerName}</h3>
                  <span className="booking-id">#{booking.bookingId}</span>
                </div>
                <span
                  className={`status-badge ${booking.status.toLowerCase()}`}
                  style={{
                    backgroundColor: bookingService.getStatusColor(
                      booking.status
                    ),
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
                  <span className="detail-icon">📍</span>
                  <div className="detail-content">
                    <span className="detail-label">Charger</span>
                    <span className="detail-value">{booking.chargerName}</span>
                  </div>
                </div>

                <div className="booking-detail">
                  <span className="detail-icon">🕐</span>
                  <div className="detail-content">
                    <span className="detail-label">Start Time</span>
                    <span className="detail-value">
                      {formatDateTime(booking.startTime)}
                    </span>
                  </div>
                </div>

                <div className="booking-detail">
                  <span className="detail-icon">🕐</span>
                  <div className="detail-content">
                    <span className="detail-label">End Time</span>
                    <span className="detail-value">
                      {formatDateTime(booking.endTime)}
                    </span>
                  </div>
                </div>

                <div className="booking-detail">
                  <span className="detail-icon">⏱</span>
                  <div className="detail-content">
                    <span className="detail-label">Duration</span>
                    <span className="detail-value">
                      {calculateDuration(booking.startTime, booking.endTime)}
                    </span>
                  </div>
                </div>

                <div className="booking-detail">
                  <span className="detail-icon">💵</span>
                  <div className="detail-content">
                    <span className="detail-label">Price Rate</span>
                    <span className="detail-value">
                      Rs {booking.pricePerKwh}/kWh
                    </span>
                  </div>
                </div>

                {booking.totalPrice && (
                  <div className="booking-detail highlight">
                    <span className="detail-icon">💰</span>
                    <div className="detail-content">
                      <span className="detail-label">Total Price</span>
                      <span className="detail-value total-price">
                        Rs {booking.totalPrice}
                      </span>
                    </div>
                  </div>
                )}

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
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>
              No {filter !== "ALL" && filter.toLowerCase()} bookings found
            </h3>
            <p>
              {filter === "ALL"
                ? "No one has booked your chargers yet. Make sure your chargers are listed and visible to users!"
                : `You don't have any ${filter.toLowerCase()} bookings at the moment.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostBookings;