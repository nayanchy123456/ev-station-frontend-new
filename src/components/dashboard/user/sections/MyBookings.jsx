import React, { useState, useEffect, useCallback, useRef } from "react";
import bookingService from "../../../../services/bookingService";
import PaymentModal from "./PaymentModal";
import PaymentTimer from "./PaymentTimer";
import ReceiptModal from "./ReceiptModal";
import "../../../../css/bookings/myBookings.css";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingForPayment, setBookingForPayment] = useState(null);

  // Track if user is interacting with the page
  const [isInteracting, setIsInteracting] = useState(false);
  const interactionTimerRef = useRef(null);

  // Fetch bookings function with useCallback to prevent unnecessary re-renders
  const fetchBookings = useCallback(async () => {
    // Don't refresh while user is interacting with payment modal or other forms
    if (showPaymentModal || showReceiptModal) {
      return;
    }

    try {
      const data = await bookingService.getMyBookings();
      setBookings(data);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  }, [showPaymentModal, showReceiptModal]);

  // Initial load
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Smart auto-refresh: only refresh when user is not actively interacting
  useEffect(() => {
    // Only set up auto-refresh if no modals are open
    if (showPaymentModal || showReceiptModal) {
      return;
    }

    // Refresh every 60 seconds (reduced from 30 seconds for better UX)
    const refreshInterval = setInterval(() => {
      // Only refresh if user hasn't interacted in the last 10 seconds
      if (!isInteracting) {
        fetchBookings();
      }
    }, 60000); // 60 seconds

    return () => clearInterval(refreshInterval);
  }, [fetchBookings, isInteracting, showPaymentModal, showReceiptModal]);

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

  const handleCancelBooking = async (bookingId, bookingStatus) => {
    const isPaid = bookingStatus === "CONFIRMED";
    const confirmMessage = isPaid
      ? "This booking is paid. Cancelling will initiate a refund. Are you sure?"
      : "Are you sure you want to cancel this booking?";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const result = await bookingService.cancelBooking(bookingId);
      
      if (result.refundProcessed) {
        alert(`✅ Booking cancelled successfully!\n\nRefund Amount: NPR ${result.refundAmount}\nRefund ID: ${result.refundId}`);
      } else {
        alert("✅ Booking cancelled successfully!");
      }
      
      // Immediate refresh after action
      await fetchBookings();
    } catch (error) {
      alert(`❌ ${error.message || "Failed to cancel booking"}`);
    }
  };

  const handlePayNow = (booking) => {
    // Convert booking to reservation format for PaymentModal
    const reservationData = {
      reservationId: booking.bookingId,
      chargerId: booking.chargerId,
      chargerName: booking.chargerName,
      startTime: booking.startTime,
      endTime: booking.endTime,
      estimatedPrice: booking.totalPrice || calculateEstimatedPrice(booking),
      pricePerKwh: booking.pricePerKwh,
      durationMinutes: bookingService.calculateDuration(booking.startTime, booking.endTime),
      reservedUntil: booking.reservedUntil,
      status: booking.status
    };
    
    setBookingForPayment(reservationData);
    setShowPaymentModal(true);
  };

  const calculateEstimatedPrice = (booking) => {
    const duration = bookingService.calculateDuration(booking.startTime, booking.endTime);
    const hours = duration / 60;
    const estimatedKwh = hours * 7;
    return (estimatedKwh * booking.pricePerKwh).toFixed(2);
  };

  const handlePaymentSuccess = async () => {
    setShowPaymentModal(false);
    setBookingForPayment(null);
    // Immediate refresh after successful payment
    await fetchBookings();
  };

  const handlePaymentClose = async () => {
    setShowPaymentModal(false);
    setBookingForPayment(null);
    // Refresh to catch any status changes
    await fetchBookings();
  };

  const handleReservationExpire = async () => {
    setShowPaymentModal(false);
    setBookingForPayment(null);
    // Immediate refresh after expiration
    await fetchBookings();
  };

  const handleViewReceipt = (booking) => {
    setSelectedBooking(booking);
    setShowReceiptModal(true);
  };

  const handleManualRefresh = async () => {
    setLoading(true);
    await fetchBookings();
  };

  const filteredBookings = filter === "ALL" 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  const sortedBookings = bookingService.sortByStartTime(filteredBookings);

  // Count bookings by status
  const statusCounts = {
    ALL: bookings.length,
    RESERVED: bookings.filter(b => b.status === "RESERVED").length,
    PAYMENT_PENDING: bookings.filter(b => b.status === "PAYMENT_PENDING").length,
    CONFIRMED: bookings.filter(b => b.status === "CONFIRMED").length,
    ACTIVE: bookings.filter(b => b.status === "ACTIVE").length,
    COMPLETED: bookings.filter(b => b.status === "COMPLETED").length,
    CANCELLED: bookings.filter(b => b.status === "CANCELLED").length,
    EXPIRED: bookings.filter(b => b.status === "EXPIRED").length,
  };

  if (loading) {
    return (
      <div className="my-bookings-loading">
        <div className="spinner"></div>
        <p>Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="my-bookings-container">
      <div className="page-header">
        <h1 className="page-title">My Bookings</h1>
        <button className="refresh-btn" onClick={handleManualRefresh} disabled={loading}>
          <span className="refresh-icon">🔄</span>
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {Object.keys(statusCounts).map(status => (
          <button
            key={status}
            className={`filter-tab ${filter === status ? 'active' : ''} ${bookingService.getStatusBadgeClass(status)}`}
            onClick={() => setFilter(status)}
          >
            <span className="tab-label">
              {status === "ALL" ? "All Bookings" : bookingService.getStatusDisplayText(status)}
            </span>
            {statusCounts[status] > 0 && (
              <span className="tab-count">{statusCounts[status]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {sortedBookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>No bookings found</h3>
          <p>
            {filter === "ALL" 
              ? "Book a charger to see it here"
              : `No ${bookingService.getStatusDisplayText(filter).toLowerCase()} bookings`
            }
          </p>
        </div>
      ) : (
        <div className="bookings-grid">
          {sortedBookings.map(booking => (
            <BookingCard
              key={booking.bookingId}
              booking={booking}
              onCancel={handleCancelBooking}
              onPayNow={handlePayNow}
              onViewReceipt={handleViewReceipt}
              onRefresh={fetchBookings}
            />
          ))}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && bookingForPayment && (
        <PaymentModal
          reservation={bookingForPayment}
          onSuccess={handlePaymentSuccess}
          onClose={handlePaymentClose}
          onExpire={handleReservationExpire}
        />
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedBooking && (
        <ReceiptModal
          bookingId={selectedBooking.bookingId}
          onClose={() => {
            setShowReceiptModal(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
};

// BookingCard Component
const BookingCard = ({ booking, onCancel, onPayNow, onViewReceipt, onRefresh }) => {
  const statusColor = bookingService.getStatusColor(booking.status);
  const needsPayment = bookingService.needsPayment(booking.status);
  const canCancel = bookingService.canCancelBooking(booking.status, booking.startTime);
  const hasReceipt = ["CONFIRMED", "ACTIVE", "COMPLETED"].includes(booking.status);
  const isExpired = booking.status === "EXPIRED";
  const isReserved = booking.status === "RESERVED";
  const isPaymentPending = booking.status === "PAYMENT_PENDING";

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getDurationText = () => {
    const duration = bookingService.calculateDuration(booking.startTime, booking.endTime);
    return bookingService.formatDuration(duration);
  };

  return (
    <div className={`booking-card ${needsPayment ? 'needs-payment' : ''} ${isExpired ? 'expired-card' : ''}`} 
         style={{ borderLeftColor: statusColor }}>
      
      {/* Timer for RESERVED/PAYMENT_PENDING bookings */}
      {needsPayment && booking.reservedUntil && !isExpired && (
        <div className="card-timer-section">
          <PaymentTimer 
            reservedUntil={booking.reservedUntil}
            onExpire={onRefresh}
            showWarning={true}
          />
        </div>
      )}

      {/* Payment Required Banner */}
      {(isReserved || isPaymentPending) && !isExpired && (
        <div className="payment-required-banner">
          <span className="banner-icon">⚠️</span>
          <div className="banner-content">
            <strong>Payment Required</strong>
            <p>Complete payment within 10 minutes to confirm your booking</p>
          </div>
        </div>
      )}

      <div className="booking-header">
        <div className="header-left">
          <h3 className="charger-name">
            <span className="charger-icon">🔌</span>
            {booking.chargerName}
          </h3>
          <span className="booking-id">Booking #{booking.bookingId}</span>
        </div>
        <span 
          className={`booking-status ${bookingService.getStatusBadgeClass(booking.status)}`}
          style={{ backgroundColor: statusColor }}
        >
          {bookingService.getStatusDisplayText(booking.status)}
        </span>
      </div>

      <div className="booking-details">
        <div className="detail-row">
          <span className="detail-icon">📅</span>
          <div className="detail-content">
            <span className="detail-label">Start Time</span>
            <span className="detail-value">{formatDateTime(booking.startTime)}</span>
          </div>
        </div>
        
        <div className="detail-row">
          <span className="detail-icon">🏁</span>
          <div className="detail-content">
            <span className="detail-label">End Time</span>
            <span className="detail-value">{formatDateTime(booking.endTime)}</span>
          </div>
        </div>

        <div className="detail-row">
          <span className="detail-icon">⏱️</span>
          <div className="detail-content">
            <span className="detail-label">Duration</span>
            <span className="detail-value">{getDurationText()}</span>
          </div>
        </div>

        {booking.totalPrice && (
          <div className="detail-row highlight">
            <span className="detail-icon">💰</span>
            <div className="detail-content">
              <span className="detail-label">Total Amount</span>
              <span className="detail-value price">NPR {parseFloat(booking.totalPrice).toFixed(2)}</span>
            </div>
          </div>
        )}

        {!booking.totalPrice && booking.pricePerKwh && (
          <div className="detail-row">
            <span className="detail-icon">⚡</span>
            <div className="detail-content">
              <span className="detail-label">Rate</span>
              <span className="detail-value">NPR {booking.pricePerKwh}/kWh</span>
            </div>
          </div>
        )}
      </div>

      {/* Warning for expired bookings */}
      {isExpired && (
        <div className="expired-notice">
          <span className="notice-icon">⏰</span>
          <p>This reservation expired because payment was not completed within 10 minutes.</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="booking-actions">
        {needsPayment && !isExpired && (
          <button 
            className="btn btn-primary pay-now-btn pulse-btn"
            onClick={() => onPayNow(booking)}
          >
            <span className="btn-icon">💳</span>
            Complete Payment Now
          </button>
        )}

        {hasReceipt && (
          <button 
            className="btn btn-secondary"
            onClick={() => onViewReceipt(booking)}
          >
            <span className="btn-icon">📄</span>
            View Receipt
          </button>
        )}

        {canCancel && (
          <button 
            className="btn btn-danger"
            onClick={() => onCancel(booking.bookingId, booking.status)}
          >
            <span className="btn-icon">❌</span>
            Cancel Booking
          </button>
        )}

        {booking.status === "ACTIVE" && (
          <div className="active-notice">
            <span className="pulse-dot"></span>
            <span>Charging in progress</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;