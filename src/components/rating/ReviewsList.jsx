import React, { useState, useEffect } from "react";
import StarRating from "./StarRating";
import ratingService from "../../services//ratingService.js";
import "../../css/rating/reviewsList.css";

/**
 * ReviewsList Component
 * Displays paginated list of reviews for a charger
 * 
 * @param {number} chargerId - ID of the charger
 */
const ReviewsList = ({ chargerId }) => {
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const PAGE_SIZE = 10;

  useEffect(() => {
    if (chargerId) {
      fetchReviews();
    }
  }, [chargerId, currentPage]);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ratingService.getChargerRatings(chargerId, currentPage, PAGE_SIZE);
      setReviews(data.content);
      setTotalPages(data.totalPages);
      setTotalReviews(data.totalElements);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="reviews-list-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error && reviews.length === 0) {
    return null; // Silently hide if there's an error
  }

  if (reviews.length === 0 && !loading) {
    return (
      <div className="reviews-list-container">
        <div className="reviews-empty">
          <span className="empty-icon">📝</span>
          <h3>No Reviews Yet</h3>
          <p>Be the first to share your experience with this charger!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-list-container">
      <div className="reviews-header">
        <h3 className="reviews-title">
          All Reviews ({totalReviews})
        </h3>
      </div>

      <div className="reviews-grid">
        {reviews.map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <div className="reviewer-info">
                <div className="reviewer-name-section">
                  <span className="reviewer-avatar">
                    {review.userName.charAt(0).toUpperCase()}
                  </span>
                  <div className="reviewer-details">
                    <span className="reviewer-name">{review.userName}</span>
                    <span className="review-date">
                      {ratingService.formatRatingDate(review.createdAt)}
                    </span>
                  </div>
                </div>
                <StarRating value={review.ratingScore} size="small" />
              </div>
            </div>

            {review.comment && (
              <p className="review-comment">{review.comment}</p>
            )}

            {review.updatedAt && review.updatedAt !== review.createdAt && (
              <div className="edited-indicator">
                <span className="edited-icon">✏️</span>
                <span className="edited-text">Edited</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {loading && reviews.length > 0 && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 0 || loading}
            className="pagination-btn"
            aria-label="Previous page"
          >
            <span>←</span> Previous
          </button>
          
          <span className="page-indicator">
            Page {currentPage + 1} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= totalPages - 1 || loading}
            className="pagination-btn"
            aria-label="Next page"
          >
            Next <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsList;