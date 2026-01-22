import React, { useState, useEffect } from "react";
import bookingService from "../../../../services/bookingService";
import   "../../../../css/bookings/bookCharger.css";
const BookCharger = ({ charger, onBookingSuccess, onClose }) => {
  const [bookingData, setBookingData] = useState({
    startTime: "",
    endTime: "",
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingBookings, setExistingBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchChargerBookings();
  }, [charger.id]);

  const fetchChargerBookings = async () => {
    setLoadingBookings(true);
    try {
      const bookings = await bookingService.getChargerBookings(charger.id);
      const activeBookings = bookings.filter(b => b.status !== "CANCELLED");
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

  const isTimeSlotBooked = (date, hour) => {
    const slotStart = new Date(date);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(slotStart);
    slotEnd.setHours(hour + 1, 0, 0, 0);

    return existingBookings.some(booking => {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      return slotStart < bookingEnd && slotEnd > bookingStart;
    });
  };

  const isPastTime = (date, hour) => {
    const slotTime = new Date(date);
    slotTime.setHours(hour, 0, 0, 0);
    return slotTime < new Date(Date.now() + 15 * 60000);
  };

  const handleSlotClick = (hour) => {
    const start = new Date(selectedDate);
    start.setHours(hour, 0, 0, 0);
    
    const end = new Date(start);
    end.setHours(hour + 2, 0, 0, 0); // Default 2 hour booking

    const formatDateTime = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    setBookingData({
      startTime: formatDateTime(start),
      endTime: formatDateTime(end)
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData({ ...bookingData, [name]: value });
    if (statusMessage) setStatusMessage("");
  };

  const calculateDuration = () => {
    if (!bookingData.startTime || !bookingData.endTime) return null;
    const start = new Date(bookingData.startTime);
    const end = new Date(bookingData.endTime);
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
      bookingData.startTime, 
      bookingData.endTime
    );

    if (!validation.isValid) {
      setStatusMessage(`❌ ${validation.errors.join(", ")}`);
      return;
    }

    if (checkTimeConflict(bookingData.startTime, bookingData.endTime)) {
      setStatusMessage("❌ Your selected time conflicts with an existing booking!");
      return;
    }

    setIsSubmitting(true);
    try {
      await bookingService.createBooking({
        chargerId: charger.id,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
      });
      setStatusMessage("✅ Booking created successfully!");
      setTimeout(() => {
        if (onBookingSuccess) onBookingSuccess();
      }, 1500);
    } catch (err) {
      setStatusMessage(`❌ ${err.message || "Failed to create booking"}`);
    } finally {
      setIsSubmitting(false);
    }
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

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="book-charger-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>✖</button>
        
        <h2 className="modal-title">Book {charger.name}</h2>

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
              <span>Booked</span>
            </div>
            <div className="legend-item">
              <div className="legend-box past"></div>
              <span>Past</span>
            </div>
          </div>

          {loadingBookings ? (
            <div className="loading-box">
              <div className="spinner"></div>
              <p>Loading...</p>
            </div>
          ) : (
            <div className="time-grid">
              {hours.map(hour => {
                const isBooked = isTimeSlotBooked(selectedDate, hour);
                const isPast = isPastTime(selectedDate, hour);
                const isAvailable = !isBooked && !isPast;
                
                return (
                  <div
                    key={hour}
                    onClick={() => isAvailable && handleSlotClick(hour)}
                    className={`time-slot ${
                      isPast ? 'past' : 
                      isBooked ? 'booked' : 
                      'available'
                    } ${isAvailable ? 'clickable' : ''}`}
                  >
                    <div className="slot-time">
                      {hour.toString().padStart(2, '0')}:00
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
              <label>Start Time</label>
              <input
                type="datetime-local"
                name="startTime"
                value={bookingData.startTime}
                onChange={handleChange}
                min={new Date(Date.now() + 15 * 60000).toISOString().slice(0, 16)}
              />
            </div>

            <div className="form-group">
              <label>End Time</label>
              <input
                type="datetime-local"
                name="endTime"
                value={bookingData.endTime}
                onChange={handleChange}
                min={bookingData.startTime}
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
                  <span className="summary-value">Rs {estimatedCost}</span>
                </div>
              )}
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
                Creating...
              </>
            ) : (
              "Confirm Booking"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCharger;