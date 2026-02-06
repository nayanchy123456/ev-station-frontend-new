import React, { useState, useEffect } from "react";
import StarRating from "./StarRating";
import ratingService from "../../services/ratingService";
import "../../css/rating/RatingSummary.css";

/**
 * ChargerRatingSummary Component
 * Displays average rating and star distribution for a charger
 * 
 * @param {number} chargerId - ID of the charger
 */
const ChargerRatingSummary = ({ chargerId }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (chargerId) {
      fetchSummary();
    }
  }, [chargerId]);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ratingService.getChargerRatingSummary(chargerId);
      setSummary(data);
    } catch (err) {
      console.error("Error fetching rating summary:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rating-summary-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading ratings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return null; // Silently hide if there's an error
  }

  if (!summary || summary.totalRatings === 0) {
    return (
      <div className="rating-summary-container">
        <div className="no-ratings-state">
          <p>No ratings yet. Be the first to rate this charger!</p>
        </div>
      </div>
    );
  }

  const distribution = ratingService.calculateStarDistribution(summary);

  return (
    <div className="rating-summary-container">
      <h3 className="summary-title">Customer Reviews</h3>
      
      <div className="rating-overview">
        {/* Average Rating Section */}
        <div className="average-rating">
          <div className="rating-number">{summary.averageRating.toFixed(1)}</div>
          <StarRating value={summary.averageRating} size="large" />
          <div className="rating-subtitle">
            Based on {summary.totalRatings} review{summary.totalRatings !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Star Distribution Section */}
        <div className="rating-distribution">
          {distribution.map((item) => (
            <div key={item.stars} className="distribution-row">
              <span className="stars-label">{item.stars} ★</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${item.percentage}%` }}
                  title={`${item.count} ratings (${item.percentage}%)`}
                />
              </div>
              <span className="count-label">
                {item.count} ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChargerRatingSummary;