import React, { useState, useEffect } from "react";
import RatingModal from "./RatingModal";
import StarRating from "./StarRating";
import ratingService from "../../services/ratingService.js";
import "../../css/rating/ratingButton.css";

/**
 * RatingButton Component
 * Button displayed on completed bookings for rating
 * 
 * @param {number} bookingId - ID of the booking
 * @param {number} chargerId - ID of the charger
 * @param {string} chargerName - Name of the charger
 * @param {string} startTime - Booking start time (ISO string)
 * @param {function} onRatingSubmit - Callback after successful rating
 */
const RatingButton = ({
  bookingId,
  chargerId,
  chargerName,
  startTime,
  onRatingSubmit
}) => {
  const [existingRating, setExistingRating] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchExistingRating();
  }, [bookingId]);

  const fetchExistingRating = async () => {
    setIsLoading(true);
    try {
      const rating = await ratingService.getRatingByBookingId(bookingId);
      setExistingRating(rating);
    } catch (error) {
      console.error("Error fetching existing rating:", error);
      setExistingRating(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingSuccess = async (newRating) => {
    setExistingRating(newRating);
    setIsModalOpen(false);
    
    if (onRatingSubmit) {
      onRatingSubmit(newRating);
    }
  };

  const handleEditClick = () => {
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <button className="rating-button loading" disabled>
        <span className="btn-spinner"></span>
        Loading...
      </button>
    );
  }

  if (existingRating) {
    return (
      <>
        <button 
          className="rating-button rated"
          onClick={handleEditClick}
        >
          <span className="btn-icon">✓</span>
          <div className="rating-info">
            <span className="rating-label">Rated</span>
            <StarRating 
              value={existingRating.ratingScore}
              size="small"
            />
          </div>
          <span className="edit-hint">(Click to edit)</span>
        </button>

        <RatingModal
          booking={{
            bookingId,
            chargerId,
            chargerName,
            startTime
          }}
          existingRating={existingRating}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleRatingSuccess}
        />
      </>
    );
  }

  return (
    <>
      <button 
        className="rating-button unrated"
        onClick={() => setIsModalOpen(true)}
      >
        <span className="btn-icon">⭐</span>
        <span className="btn-text">Rate This Experience</span>
      </button>

      <RatingModal
        booking={{
          bookingId,
          chargerId,
          chargerName,
          startTime
        }}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleRatingSuccess}
      />
    </>
  );
};

export default RatingButton;