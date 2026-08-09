import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import "../../../css/analytics.css";
import { FaStar, FaSpinner } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const UserRatingAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [ratingData, setRatingData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRatingData();
  }, []);

  const fetchRatingData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/analytics/user/ratings`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setRatingData(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching rating data:", err);
      setError("Failed to load rating analytics");
    } finally {
      setLoading(false);
    }
  };

  const getRatingDistributionData = () => {
    if (!ratingData?.ratingDistribution?.distribution) {
      return null;
    }

    const distribution = ratingData.ratingDistribution.distribution;
    const labels = [];
    const counts = [];
    const percentages = [];

    // Extract data for 1-5 stars
    for (let i = 1; i <= 5; i++) {
      labels.push(`${i} Star${i > 1 ? 's' : ''}`);
      const ratingCount = distribution[i];
      counts.push(ratingCount?.count || 0);
      percentages.push(ratingCount?.percentage || 0);
    }

    return {
      labels: labels,
      datasets: [
        {
          label: 'Number of Ratings',
          data: counts,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(54, 162, 235, 0.6)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(54, 162, 235, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context) {
            const distribution = ratingData?.ratingDistribution?.distribution;
            if (!distribution) return '';
            
            const starRating = context.dataIndex + 1;
            const ratingCount = distribution[starRating];
            const percentage = ratingCount?.percentage || 0;
            
            return `${percentage.toFixed(1)}% of all ratings`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          color={i <= rating ? "#ffc107" : "#e4e5e9"}
          size={16}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <FaSpinner className="spinner" />
        <p>Loading rating analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <p>{error}</p>
        <button onClick={fetchRatingData} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  const ratingDistChart = getRatingDistributionData();

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>
          <FaStar /> Rating Analytics
        </h2>
      </div>

      {/* Summary Cards */}
      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="card-icon rating">
            <FaStar />
          </div>
          <div className="card-content">
            <h3>Total Reviews</h3>
            <p className="card-value">{ratingData?.totalReviewsGiven || 0}</p>
            <span className="card-label">Reviews given</span>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-icon" style={{backgroundColor: '#ffc107'}}>
            <FaStar />
          </div>
          <div className="card-content">
            <h3>Average Rating</h3>
            <p className="card-value">
              {ratingData?.averageRatingGiven 
                ? ratingData.averageRatingGiven.toFixed(2)
                : '0.00'}
            </p>
            <span className="card-label">Your average rating</span>
          </div>
        </div>
      </div>

      {/* Rating Distribution Chart */}
      {ratingDistChart && (
        <div className="chart-container">
          <h3>Rating Distribution</h3>
          <div className="chart-wrapper" style={{ height: '300px' }}>
            <Bar data={ratingDistChart} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Rating Distribution Details */}
      {ratingData?.ratingDistribution?.distribution && (
        <div className="rating-distribution-details">
          <h3>Rating Breakdown</h3>
          <div className="rating-bars">
            {[5, 4, 3, 2, 1].map((stars) => {
              const ratingCount = ratingData.ratingDistribution.distribution[stars];
              const count = ratingCount?.count || 0;
              const percentage = ratingCount?.percentage || 0;
              const total = ratingData.totalReviewsGiven || 1;
              const barWidth = (count / total) * 100;

              return (
                <div key={stars} className="rating-bar-row">
                  <div className="rating-label">
                    {stars} <FaStar color="#ffc107" size={14} />
                  </div>
                  <div className="rating-bar-container">
                    <div 
                      className="rating-bar-fill" 
                      style={{ 
                        width: `${barWidth}%`,
                        backgroundColor: stars >= 4 ? '#28a745' : stars >= 3 ? '#ffc107' : '#dc3545'
                      }}
                    />
                  </div>
                  <div className="rating-count">
                    {count} ({percentage.toFixed(1)}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Ratings */}
      {ratingData?.recentRatings && ratingData.recentRatings.length > 0 && (
        <div className="table-container">
          <h3>Recent Ratings</h3>
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Charger</th>
                <th>Rating</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              {ratingData.recentRatings.map((rating, index) => (
                <tr key={index}>
                  <td>
                    {rating.date 
                      ? new Date(rating.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : 'N/A'}
                  </td>
                  <td>{rating.chargerName || 'Unknown'}</td>
                  <td>
                    <div className="star-rating">
                      {renderStars(rating.rating)}
                      <span className="rating-number">({rating.rating}/5)</span>
                    </div>
                  </td>
                  <td className="comment-cell">
                    {rating.comment || <em>No comment</em>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {(!ratingData?.recentRatings || ratingData.recentRatings.length === 0) && (
        <div className="empty-state">
          <FaStar size={48} color="#ccc" />
          <p>No ratings yet.</p>
          <p>Start rating chargers after your charging sessions!</p>
        </div>
      )}
    </div>
  );
};

export default UserRatingAnalytics;