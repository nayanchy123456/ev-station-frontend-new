import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bookingService from "../../../../services/bookingService";
import "../../../../css/bookings/bookCharger.css";

const BookCharger = ({ charger, onBookingSuccess, onClose }) => {
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState({
    startTime: "",
    endTime: "",
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
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
    const estimatedKwh = duration * 7; // average 7kW
    return (estimatedKwh * charger.pricePerKwh).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage("");
    setIsSubmitting(true);

    try {
      const payload = {
        chargerId: charger.id,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
      };
      await bookingService.createBooking(payload);
      setStatusMessage("✅ Booking created successfully!");
      setTimeout(() => {
        onBookingSuccess();
      }, 1000);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Failed to create booking";
      setStatusMessage(`❌ ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const duration = calculateDuration();
  const estimatedCost = calculateEstimatedCost();

  return (
    <div className="book-charger-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>✖</button>
        <h2>Book {charger.name}</h2>

        {statusMessage && (
          <p className={`status-message ${statusMessage.includes('✅') ? 'success' : 'error'}`}>
            {statusMessage}
          </p>
        )}

        <form className="booking-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Start Time *</label>
            <input
              type="datetime-local"
              name="startTime"
              value={bookingData.startTime}
              onChange={handleChange}
              required
              min={new Date(Date.now() + 15 * 60000).toISOString().slice(0, 16)}
            />
          </div>

          <div className="form-group">
            <label>End Time *</label>
            <input
              type="datetime-local"
              name="endTime"
              value={bookingData.endTime}
              onChange={handleChange}
              required
              min={bookingData.startTime}
            />
          </div>

          {duration && (
            <div className="booking-summary">
              <p>Duration: {duration} hours</p>
              {estimatedCost && <p>Estimated Cost: Rs {estimatedCost}</p>}
              <small>* Final cost may vary based on actual consumption</small>
            </div>
          )}

          <button type="submit" disabled={isSubmitting || !duration}>
            {isSubmitting ? "Creating Booking..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookCharger;
