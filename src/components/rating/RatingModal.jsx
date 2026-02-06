import React, { useState, useEffect } from "react";
import StarRating from "./StarRating";
import ratingService from "../../services/ratingService.js";
import "../../css/rating/ratingModal.css";

/**
 * ⭐ IMPROVED RatingModal Component
 * Modal for creating or editing a rating with better UX
 * 
 * IMPROVEMENTS:
 * - Modal is scrollable when content is long
 * - Background can be scrolled on mobile
 * - Smooth animations
 * - Better positioning
 * - Escape key to close
 * 
 * @param {Object} booking - Booking object { bookingId, chargerId, chargerName, startTime }
 * @param {Object} existingRating - Existing rating if editing (null for new rating)
 * @param {boolean} isOpen - Whether modal is open
 * @param {function} onClose - Callback when modal is closed
 * @param {function} onSuccess - Callback when rating is successfully submitted
 */
const RatingModal = ({
  booking,
  existingRating = null,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [ratingScore, setRatingScore] = useState(existingRating?.ratingScore || 0);
  const [comment, setComment] = useState(existingRating?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [characterCount, setCharacterCount] = useState(existingRating?.comment?.length || 0);

  const MAX_COMMENT_LENGTH = 1000;
  const isEditing = !!existingRating;

  // ⭐ IMPROVED: Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, isSubmitting]);

  // ⭐ IMPROVED: Prevent body scroll only on desktop, allow on mobile
  useEffect(() => {
    if (isOpen) {
      // Only prevent scroll on desktop
      if (window.innerWidth > 768) {
        document.body.style.overflow = "hidden";
      }
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    setCharacterCount(comment.length);
  }, [comment]);

  // ⭐ NEW: Reset form when opening with existing rating
  useEffect(() => {
    if (isOpen && existingRating) {
      setRatingScore(existingRating.ratingScore);
      setComment(existingRating.comment || "");
    }
  }, [isOpen, existingRating]);

  const handleCommentChange = (e) => {
    const text = e.target.value;
    if (text.length <= MAX_COMMENT_LENGTH) {
      setComment(text);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (ratingScore === 0) {
      setError("Please select a rating");
      return;
    }

    if (comment.length > MAX_COMMENT_LENGTH) {
      setError(`Comment must not exceed ${MAX_COMMENT_LENGTH} characters`);
      return;
    }

    setIsSubmitting(true);

    try {
      const ratingData = {
        bookingId: booking.bookingId,
        ratingScore,
        comment: comment.trim()
      };

      let result;
      if (isEditing) {
        result = await ratingService.updateRating(existingRating.id, ratingData);
      } else {
        result = await ratingService.createRating(ratingData);
      }

      console.log("✅ Rating submitted successfully:", result);
      
      // Call success callback
      if (onSuccess) {
        onSuccess(result);
      }

      // Reset form
      setRatingScore(0);
      setComment("");
      setError("");
      
      // Close modal
      onClose();
    } catch (err) {
      console.error("❌ Error submitting rating:", err);
      setError(err.message || "Failed to submit rating. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      setRatingScore(existingRating?.ratingScore || 0);
      setComment(existingRating?.comment || "");
      setError("");
      onClose();
    }
  };

  // ⭐ IMPROVED: Click on overlay to close (with better handling)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  const formattedDate = booking.startTime
    ? new Date(booking.startTime).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    : "";

  return (
    <div className="rating-modal-overlay" onClick={handleOverlayClick}>
      <div className="rating-modal-content">
        {/* Header */}
        <div className="rating-modal-header">
          <h2>{isEditing ? "Edit Your Rating" : "Rate Your Experience"}</h2>
          <button
            className="close-button"
            onClick={handleCancel}
            aria-label="Close modal"
            disabled={isSubmitting}
            type="button"
          >
            ×
          </button>
        </div>

        {/* Booking Info */}
        <div className="booking-info-section">
          <div className="charger-name">
            <span className="charger-icon">🔌</span>
            <strong>{booking.chargerName}</strong>
          </div>
          {formattedDate && (
            <div className="booking-date">
              <span className="date-icon">📅</span>
              <span>{formattedDate}</span>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rating-form">
          {/* Star Rating Section */}
          <div className="form-group">
            <label className="form-label">How was your experience?</label>
            <div className="star-selection-container">
              <StarRating
                value={ratingScore}
                onChange={setRatingScore}
                interactive
                size="large"
              />
            </div>
            {ratingScore > 0 && (
              <p className="rating-description">
                {getRatingDescription(ratingScore)}
              </p>
            )}
          </div>

          {/* Comment Section */}
          <div className="form-group">
            <label className="form-label" htmlFor="rating-comment">
              Add a review <span className="optional-label">(optional)</span>
            </label>
            <textarea
              id="rating-comment"
              className="comment-textarea"
              placeholder="Share details about your charging experience..."
              value={comment}
              onChange={handleCommentChange}
              rows={5}
              maxLength={MAX_COMMENT_LENGTH}
              disabled={isSubmitting}
            />
            <div className="character-counter">
              <span className={characterCount > MAX_COMMENT_LENGTH * 0.9 ? 'warning' : ''}>
                {characterCount}/{MAX_COMMENT_LENGTH} characters
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || ratingScore === 0}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-icon"></span>
                  {isEditing ? "Updating..." : "Submitting..."}
                </>
              ) : (
                <>
                  <span className="submit-icon">✓</span>
                  {isEditing ? "Update Rating" : "Submit Rating"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * Get descriptive text based on rating score
 */
const getRatingDescription = (score) => {
  const descriptions = {
    1: "😞 Poor - Not satisfied with the service",
    2: "😕 Fair - Below expectations",
    3: "😐 Good - Met expectations",
    4: "😊 Very Good - Exceeded expectations",
    5: "🤩 Excellent - Outstanding service!"
  };
  return descriptions[score] || "";
};

export default RatingModal;