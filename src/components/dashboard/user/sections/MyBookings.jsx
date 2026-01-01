import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../services/api";
import BookingCard from "./BookingCard";
import "../../../../css/bookings/myBookings.css";

const MyBookings = ({ setActiveSection }) => { // ✅ receive setActiveSection from parent
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setStatusMessage("");
    try {
      const response = await api.get("/bookings/my");
      setBookings(response.data);
      if (!response.data.length) {
        setStatusMessage("ℹ️ No bookings yet. Book your first charger!");
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setStatusMessage("❌ Failed to fetch bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    const booking = bookings.find((b) => b.bookingId === bookingId);
    if (!booking) return;

    if (booking.status !== "CONFIRMED") {
      setStatusMessage("❌ Only confirmed bookings can be cancelled");
      return;
    }

    const now = new Date();
    const startTime = new Date(booking.startTime);
    const hourBefore = new Date(startTime.getTime() - 60 * 60 * 1000);

    if (now >= hourBefore) {
      setStatusMessage("❌ Cannot cancel within 1 hour of start time");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to cancel this booking?\n\n` +
          `Charger: ${booking.chargerName}\n` +
          `Start: ${new Date(booking.startTime).toLocaleString()}\n\n` +
          `This action cannot be undone.`
      )
    ) {
      return;
    }

    setCancellingId(bookingId);
    setStatusMessage("");

    try {
      const response = await api.put(`/bookings/${bookingId}/cancel`);
      console.log("Booking cancelled:", response.data);
      setStatusMessage("✅ Booking cancelled successfully");
      await fetchBookings(); // Refresh the list
    } catch (err) {
      console.error("Cancellation error:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to cancel booking";
      setStatusMessage(`❌ ${errorMsg}`);
    } finally {
      setCancellingId(null);
    }
  };

  // ✅ simplified: just update the active section instead of CustomEvent
  const handleFindChargers = () => {
    setActiveSection("chargers");
  };

  const getFilteredBookings = () => {
    if (filter === "ALL") return bookings;
    return bookings.filter((b) => b.status === filter);
  };

  const getStatusCount = (status) => {
    if (status === "ALL") return bookings.length;
    return bookings.filter((b) => b.status === status).length;
  };

  const filteredBookings = getFilteredBookings();

  const upcomingBookings = bookings.filter(
    (b) => b.status === "CONFIRMED" && new Date(b.startTime) > new Date()
  );
  const activeBookings = bookings.filter((b) => b.status === "ACTIVE");
  const pastBookings = bookings.filter(
    (b) => b.status === "COMPLETED" || b.status === "CANCELLED"
  );

  return (
    <div className="my-bookings-container">
      <div className="bookings-header">
        <div className="header-content">
          <h2>⚡ My Bookings</h2>
          <p className="header-subtitle">Manage your EV charging reservations</p>
        </div>
        <button className="new-booking-btn" onClick={handleFindChargers}>
          <span>+</span> New Booking
        </button>
      </div>

      {statusMessage && (
        <div
          className={`status-banner ${
            statusMessage.includes("✅")
              ? "success"
              : statusMessage.includes("❌")
              ? "error"
              : "info"
          }`}
        >
          {statusMessage}
        </div>
      )}

      {!loading && bookings.length > 0 && (
        <div className="booking-stats">
          <div className="stat-card">
            <span className="stat-icon">📅</span>
            <div className="stat-content">
              <span className="stat-value">{upcomingBookings.length}</span>
              <span className="stat-label">Upcoming</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⚡</span>
            <div className="stat-content">
              <span className="stat-value">{activeBookings.length}</span>
              <span className="stat-label">Active</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">✓</span>
            <div className="stat-content">
              <span className="stat-value">{pastBookings.length}</span>
              <span className="stat-label">Past</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📊</span>
            <div className="stat-content">
              <span className="stat-value">{bookings.length}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
        </div>
      )}

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

      <div className="bookings-list">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your bookings...</p>
          </div>
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <BookingCard
              key={booking.bookingId}
              booking={booking}
              onCancel={handleCancel}
              isCancelling={cancellingId === booking.bookingId}
            />
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>
              No {filter !== "ALL" && filter.toLowerCase()} bookings found
            </h3>
            <p>
              {filter === "ALL"
                ? "Start your EV charging journey by booking your first charger!"
                : `You don't have any ${filter.toLowerCase()} bookings at the moment.`}
            </p>
            {filter === "ALL" && (
              <button
                className="empty-action-btn"
                onClick={handleFindChargers}
              >
                Find Chargers
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
