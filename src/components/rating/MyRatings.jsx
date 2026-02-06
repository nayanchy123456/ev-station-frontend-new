import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StarRating from "./StarRating";
import RatingModal from "./RatingModal";
import ratingService from "../../../services/ratingService";
import "../../../css/rating/myRatings.css";

/**
 * MyRatings Component
 * Displays all ratings submitted by the authenticated user
 * Allows editing and deleting ratings
 */
const MyRatings = () => {
  const navigate = useNavigate();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRating, setEditingRating] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchMyRatings();
  }, []);

  const fetchMyRatings = async () => {
    setLoading(true);
    try {
      const data = await ratingService.getMyRatings(0, 50); // Get all user ratings
      setRatings(data.content);
    } catch (error) {
      console.error("Error fetching ratings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ratingId) => {
    if (!window.confirm("Are you sure you want to delete this rating? This action cannot be undone.")) {
      return;
    }

    setDeletingId(ratingId);
    try {
      await ratingService.deleteRating(ratingId);
      await fetchMyRatings(); // Refresh list
    } catch (error) {
      alert("Failed to delete rating: " + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (rating) => {
    setEditingRating(rating);
    setIsModalOpen(true);
  };

  const handleRatingSuccess = async () => {
    setIsModalOpen(false);
    setEditingRating(null);
    await fetchMyRatings(); // Refresh list
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingRating(null);
  };

  if (loading) {
    return (
      <div className="my-ratings-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your ratings...</p>
        </div>
      </div>
    );
  }

  if (ratings.length === 0) {
    return (
      <div className="my-ratings-container">
        <h1 className="page-title">My Ratings</h1>
        <div className="empty-state">
          <span className="empty-icon">⭐</span>
          <h2>No Ratings Yet</h2>
          <p>You haven't rated any chargers yet.</p>
          <p>Complete a booking to leave your first rating!</p>
          <button 
            className="btn-primary"
            onClick={() => navigate("/user-dashboard")}
          >
            <span>🔌</span>
            Find Chargers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-ratings-container">
      <div className="page-header">
        <h1 className="page-title">My Ratings</h1>
        <div className="ratings-count">
          {ratings.length} rating{ratings.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="ratings-grid">
        {ratings.map((rating) => (
          <div key={rating.id} className="rating-card">
            <div className="rating-card-header">
              <div className="charger-info">
                <span className="charger-icon">🔌</span>
                <h3 className="charger-name">{rating.chargerName}</h3>
              </div>
              <StarRating value={rating.ratingScore} size="medium" />
            </div>

            <div className="rating-metadata">
              <span className="rating-date">
                <span className="date-icon">📅</span>
                Rated on {ratingService.formatRatingDate(rating.createdAt)}
              </span>
              {rating.updatedAt && rating.updatedAt !== rating.createdAt && (
                <span className="edited-badge">
                  <span className="edited-icon">✏️</span>
                  Edited
                </span>
              )}
            </div>

            {rating.comment && (
              <div className="rating-comment-section">
                <p className="rating-comment">"{rating.comment}"</p>
              </div>
            )}

            <div className="rating-actions">
              <button
                className="btn-action btn-view"
                onClick={() => navigate(`/user-dashboard/charger/${rating.chargerId}`)}
                title="View charger details"
              >
                <span className="btn-icon">🔌</span>
                <span className="btn-text">View Charger</span>
              </button>
              
              <button
                className="btn-action btn-edit"
                onClick={() => handleEdit(rating)}
                title="Edit rating"
              >
                <span className="btn-icon">✏️</span>
                <span className="btn-text">Edit</span>
              </button>
              
              <button
                className="btn-action btn-delete"
                onClick={() => handleDelete(rating.id)}
                disabled={deletingId === rating.id}
                title="Delete rating"
              >
                {deletingId === rating.id ? (
                  <>
                    <span className="spinner-small"></span>
                    <span className="btn-text">Deleting...</span>
                  </>
                ) : (
                  <>
                    <span className="btn-icon">🗑️</span>
                    <span className="btn-text">Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Rating Modal */}
      {isModalOpen && editingRating && (
        <RatingModal
          booking={{
            bookingId: editingRating.bookingId,
            chargerId: editingRating.chargerId,
            chargerName: editingRating.chargerName,
            startTime: editingRating.createdAt
          }}
          existingRating={editingRating}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSuccess={handleRatingSuccess}
        />
      )}
    </div>
  );
};

export default MyRatings;