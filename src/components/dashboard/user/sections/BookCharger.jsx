import React, { useState, useEffect } from "react";
import reservationService from "../../../../services/reservationService";
import bookingService from "../../../../services/bookingService";
import PaymentModal from "./PaymentModal";
import "../../../../css/bookings/bookCharger.css";

const BookCharger = ({ charger, onBookingSuccess, onClose }) => {
  const [reservationData, setReservationData] = useState({
    startTime: "",
    endTime: "",
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingBookings, setExistingBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentReservation, setCurrentReservation] = useState(null);

  useEffect(() => {
    fetchChargerBookings();
  }, [charger.id]);

  const fetchChargerBookings = async () => {
    setLoadingBookings(true);
    try {
      const bookings = await bookingService.getChargerBookings(charger.id);
      // Include RESERVED, PAYMENT_PENDING, CONFIRMED, ACTIVE in conflicts
      const activeBookings = bookings.filter(
        b => !["CANCELLED", "EXPIRED", "COMPLETED"].includes(b.status)
      );
      setExistingBookings(activeBookings);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setExistingBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const checkTimeConflict = (start, end) => {
    if (!start || !end) return false;
    const userStart = new Date(start);
    const userEnd = new Date(end);
    return existingBookings.some((booking) => {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      return userStart < bookingEnd && userEnd > bookingStart;
    });
  };

  // UPDATED: Check if a 30-minute time slot is booked
  const isTimeSlotBooked = (date, hour, minute) => {
    const slotStart = new Date(date);
    slotStart.setHours(hour, minute, 0, 0);
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + 30); // 30-minute slots

    return existingBookings.some(booking => {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      return slotStart < bookingEnd && slotEnd > bookingStart;
    });
  };

  // UPDATED: Check if a 30-minute time slot is in the past
  const isPastTime = (date, hour, minute) => {
    const slotTime = new Date(date);
    slotTime.setHours(hour, minute, 0, 0);
    return slotTime < new Date(Date.now() + 15 * 60000); // 15 minutes advance required
  };

  // UPDATED: Handle slot click with 30-minute precision, default 1-hour booking
  const handleSlotClick = (hour, minute) => {
    const start = new Date(selectedDate);
    start.setHours(hour, minute, 0, 0);
    
    const end = new Date(start);
    end.setHours(start.getHours() + 1); // Default 1-hour booking (changed from 2 hours)

    const formatDateTime = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    setReservationData({
      startTime: formatDateTime(start),
      endTime: formatDateTime(end)
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReservationData({ ...reservationData, [name]: value });
    if (statusMessage) setStatusMessage("");
  };

  const calculateDuration = () => {
    if (!reservationData.startTime || !reservationData.endTime) return null;
    const start = new Date(reservationData.startTime);
    const end = new Date(reservationData.endTime);
    const hours = (end - start) / (1000 * 60 * 60);
    return hours > 0 ? hours.toFixed(2) : null;
  };

  const calculateEstimatedCost = () => {
    const duration = calculateDuration();
    if (!duration || !charger) return null;
    const estimatedKwh = duration * 7;
    return (estimatedKwh * charger.pricePerKwh).toFixed(2);
  };

  const handleSubmit = async () => {
    setStatusMessage("");
    const validation = bookingService.validateBookingTime(
      reservationData.startTime, 
      reservationData.endTime
    );

    if (!validation.isValid) {
      setStatusMessage(`❌ ${validation.errors.join(", ")}`);
      return;
    }

    if (checkTimeConflict(reservationData.startTime, reservationData.endTime)) {
      setStatusMessage("❌ Your selected time conflicts with an existing booking!");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create reservation instead of direct booking
      const reservation = await reservationService.createReservation({
        chargerId: charger.id,
        startTime: reservationData.startTime,
        endTime: reservationData.endTime,
      });
      
      setStatusMessage("✅ Reservation created! Opening payment window...");
      setCurrentReservation(reservation);
      
      // Open payment modal after short delay
      setTimeout(() => {
        setShowPaymentModal(true);
        setStatusMessage("");
      }, 1000);
      
    } catch (err) {
      setStatusMessage(`❌ ${err.message || "Failed to create reservation"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = (paymentResult) => {
    setShowPaymentModal(false);
    setCurrentReservation(null);
    if (onBookingSuccess) onBookingSuccess();
  };

  const handlePaymentClose = () => {
    setShowPaymentModal(false);
    fetchChargerBookings();
  };

  const handleReservationExpire = () => {
    setShowPaymentModal(false);
    setCurrentReservation(null);
    setStatusMessage("⚠️ Reservation expired! Please create a new reservation.");
    fetchChargerBookings();
  };

  const duration = calculateDuration();
  const estimatedCost = calculateEstimatedCost();

  const nextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const prevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    if (prev >= new Date().setHours(0, 0, 0, 0)) {
      setSelectedDate(prev);
    }
  };

  // UPDATED: Generate 48 time slots (30-minute intervals)
  const timeSlots = Array.from({ length: 48 }, (_, i) => ({
    hour: Math.floor(i / 2),
    minute: (i % 2) * 30,
    index: i
  }));

  return (
    <>
      <div className="book-charger-modal">
        <div className="modal-overlay" onClick={onClose}></div>
        <div className="modal-content">
          <button className="close-btn" onClick={onClose}>✖</button>
          
          <h2 className="modal-title">Reserve {charger.name}</h2>
          
          <div className="info-banner">
            <div className="info-icon">⏰</div>
            <div className="info-text">
              <strong>Reservation System:</strong> You'll have 10 minutes to complete payment after creating a reservation.
            </div>
          </div>

          {/* Visual Calendar */}
          <div className="calendar-section">
            <div className="calendar-header">
              <button 
                onClick={prevDay} 
                className="nav-btn" 
                disabled={selectedDate.toDateString() === new Date().toDateString()}
              >
                ←
              </button>
              <h3 className="date-title">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <button onClick={nextDay} className="nav-btn">→</button>
            </div>

            <div className="legend">
              <div className="legend-item">
                <div className="legend-box available"></div>
                <span>Available</span>
              </div>
              <div className="legend-item">
                <div className="legend-box booked"></div>
                <span>Booked/Reserved</span>
              </div>
              <div className="legend-item">
                <div className="legend-box past"></div>
                <span>Past</span>
              </div>
            </div>

            {loadingBookings ? (
              <div className="loading-box">
                <div className="spinner"></div>
                <p>Loading availability...</p>
              </div>
            ) : (
              <div className="time-grid">
                {timeSlots.map(slot => {
                  const isBooked = isTimeSlotBooked(selectedDate, slot.hour, slot.minute);
                  const isPast = isPastTime(selectedDate, slot.hour, slot.minute);
                  const isAvailable = !isBooked && !isPast;
                  
                  // Format display time
                  const displayTime = `${slot.hour.toString().padStart(2, '0')}:${slot.minute.toString().padStart(2, '0')}`;
                  
                  return (
                    <div
                      key={slot.index}
                      onClick={() => isAvailable && handleSlotClick(slot.hour, slot.minute)}
                      className={`time-slot ${
                        isPast ? 'past' : 
                        isBooked ? 'booked' : 
                        'available'
                      } ${isAvailable ? 'clickable' : ''}`}
                      title={
                        isPast ? 'Time has passed' :
                        isBooked ? 'Already booked' :
                        'Click to select (1-hour default)'
                      }
                    >
                      <div className="slot-time">
                        {displayTime}
                      </div>
                      <div className="slot-status">
                        {isPast ? '⏱️' : isBooked ? '🔒' : '✓'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {statusMessage && (
            <div className={`status-message ${statusMessage.includes("✅") ? 'success' : 'error'}`}>
              {statusMessage}
            </div>
          )}

          {/* Manual Time Selection */}
          <div className="form-container">
            <p className="form-title">Or select exact times:</p>
            <div className="form-row">
              <div className="form-group">
                <label>Start Time *</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={reservationData.startTime}
                  onChange={handleChange}
                  min={bookingService.getMinStartTime()}
                />
              </div>

              <div className="form-group">
                <label>End Time *</label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={reservationData.endTime}
                  onChange={handleChange}
                  min={bookingService.getMinEndTime(reservationData.startTime)}
                  max={bookingService.getMaxEndTime(reservationData.startTime)}
                />
              </div>
            </div>

            {duration && (
              <div className="summary">
                <div className="summary-row">
                  <span className="summary-label">⏱️ Duration:</span>
                  <span className="summary-value">{duration} hours</span>
                </div>
                {estimatedCost && (
                  <div className="summary-row">
                    <span className="summary-label">💰 Estimated Cost:</span>
                    <span className="summary-value">NPR {estimatedCost}</span>
                  </div>
                )}
                <div className="summary-note">
                  <small>* Based on average 7kW charging rate</small>
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !duration}
              className={`submit-btn ${(isSubmitting || !duration) ? 'disabled' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <span className="btn-spinner"></span>
                  Creating Reservation...
                </>
              ) : (
                <>
                  <span className="btn-icon">🔒</span>
                  Create Reservation
                </>
              )}
            </button>
            
            <p className="help-text">
              💡 After creating a reservation, you'll be prompted to complete payment within 10 minutes to confirm your booking.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && currentReservation && (
        <PaymentModal
          reservation={currentReservation}
          onSuccess={handlePaymentSuccess}
          onClose={handlePaymentClose}
          onExpire={handleReservationExpire}
        />
      )}
    </>
  );
};

export default BookCharger;