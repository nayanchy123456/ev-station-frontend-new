import React, { useState, useEffect } from "react";
import { FaChargingStation, FaStar, FaDollarSign, FaClipboardList } from "react-icons/fa";
import {
  getHostChargers,
  formatCurrency,
  formatNumber,
} from "../../../services/analyticsService";
import { RatingDistributionChart } from "../ChartComponents";
import "../../../css/host-analytics.css";

const HostChargerAnalytics = () => {
  const [chargerData, setChargerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("LAST_7_DAYS");
  const [error, setError] = useState(null);
  const [selectedCharger, setSelectedCharger] = useState(null);

  useEffect(() => {
    fetchChargerData();
  }, [period]);

  const fetchChargerData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getHostChargers(period);
      setChargerData(data);
    } catch (err) {
      console.error("Error fetching charger data:", err);
      setError("Failed to load charger analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading charger analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchChargerData} className="btn-retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      {/* Header */}
      <div className="analytics-header">
        <div>
          <h2>Charger Performance Analytics</h2>
          <p className="analytics-subtitle">Monitor your charging stations performance</p>
        </div>
        <div className="period-selector">
          <button
            className={period === "LAST_7_DAYS" ? "active" : ""}
            onClick={() => setPeriod("LAST_7_DAYS")}
          >
            7 Days
          </button>
          <button
            className={period === "LAST_30_DAYS" ? "active" : ""}
            onClick={() => setPeriod("LAST_30_DAYS")}
          >
            30 Days
          </button>
          <button
            className={period === "ALL_TIME" ? "active" : ""}
            onClick={() => setPeriod("ALL_TIME")}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Top Performers Section */}
      <div className="top-performers-section">
        <div className="top-performers-grid">
          {/* Top by Bookings */}
          {chargerData?.topChargersByBookings && chargerData.topChargersByBookings.length > 0 && (
            <div className="top-performers-card">
              <h3 className="section-title">
                <FaClipboardList /> Top by Bookings
              </h3>
              <div className="top-performers-list">
                {chargerData.topChargersByBookings.slice(0, 5).map((charger, index) => (
                  <div key={charger.chargerId} className="top-performer-item">
                    <div className="rank-badge">#{index + 1}</div>
                    <div className="performer-info">
                      <div className="performer-name">{charger.chargerName}</div>
                      <div className="performer-subtitle">{charger.location}</div>
                    </div>
                    <div className="performer-stats">
                      <div className="stat-value">{formatNumber(charger.totalBookings)}</div>
                      <div className="stat-label">bookings</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top by Revenue */}
          {chargerData?.topChargersByRevenue && chargerData.topChargersByRevenue.length > 0 && (
            <div className="top-performers-card">
              <h3 className="section-title">
                <FaDollarSign /> Top by Revenue
              </h3>
              <div className="top-performers-list">
                {chargerData.topChargersByRevenue.slice(0, 5).map((charger, index) => (
                  <div key={charger.chargerId} className="top-performer-item">
                    <div className="rank-badge">#{index + 1}</div>
                    <div className="performer-info">
                      <div className="performer-name">{charger.chargerName}</div>
                      <div className="performer-subtitle">{charger.location}</div>
                    </div>
                    <div className="performer-stats">
                      <div className="stat-value">{formatCurrency(charger.revenue)}</div>
                      <div className="stat-label">revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* All Chargers Table */}
      {chargerData?.chargers && chargerData.chargers.length > 0 && (
        <div className="table-section">
          <h3 className="section-title">All Chargers Performance</h3>
          <div className="table-container">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Charger</th>
                  <th>Brand</th>
                  <th>Location</th>
                  <th>Bookings</th>
                  <th>Revenue</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {chargerData.chargers.map((charger) => (
                  <tr key={charger.chargerId}>
                    <td>
                      <strong>{charger.chargerName}</strong>
                    </td>
                    <td>{charger.brand || "N/A"}</td>
                    <td>{charger.location}</td>
                    <td>{formatNumber(charger.totalBookings)}</td>
                    <td className="text-success">{formatCurrency(charger.revenue)}</td>
                    <td>
                      {charger.averageRating ? (
                        <span className="rating-badge">
                          <FaStar className="star-icon" />
                          {charger.averageRating.toFixed(1)}
                          <span className="rating-count">({charger.ratingCount})</span>
                        </span>
                      ) : (
                        "No ratings"
                      )}
                    </td>
                    <td>
                      <span className={`status-badge status-${charger.status?.toLowerCase()}`}>
                        {charger.status || "ACTIVE"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-details"
                        onClick={() => setSelectedCharger(charger)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Charger Details Modal */}
      {selectedCharger && (
        <div className="modal-overlay" onClick={() => setSelectedCharger(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <FaChargingStation /> {selectedCharger.chargerName}
              </h3>
              <button className="modal-close" onClick={() => setSelectedCharger(null)}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {/* Charger Info */}
              <div className="charger-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Brand:</span>
                  <span className="detail-value">{selectedCharger.brand || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{selectedCharger.location}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total Bookings:</span>
                  <span className="detail-value">{formatNumber(selectedCharger.totalBookings)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Revenue:</span>
                  <span className="detail-value text-success">
                    {formatCurrency(selectedCharger.revenue)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Average Rating:</span>
                  <span className="detail-value">
                    {selectedCharger.averageRating
                      ? `${selectedCharger.averageRating.toFixed(1)} ★`
                      : "No ratings"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className={`status-badge status-${selectedCharger.status?.toLowerCase()}`}>
                    {selectedCharger.status || "ACTIVE"}
                  </span>
                </div>
              </div>

              {/* Rating Distribution */}
              {selectedCharger.ratingDistribution && (
                <div className="rating-distribution-section">
                  <RatingDistributionChart
                    distribution={selectedCharger.ratingDistribution}
                    title="Rating Distribution"
                  />
                </div>
              )}

              {/* Most Frequent Users */}
              {selectedCharger.mostFrequentUsers && selectedCharger.mostFrequentUsers.length > 0 && (
                <div className="frequent-users-section">
                  <h4 className="section-subtitle">Most Frequent Users</h4>
                  <div className="frequent-users-list">
                    {selectedCharger.mostFrequentUsers.map((user, index) => (
                      <div key={user.userId} className="frequent-user-item">
                        <div className="user-rank">#{index + 1}</div>
                        <div className="user-info">
                          <div className="user-name">{user.userName}</div>
                          <div className="user-email">{user.userEmail}</div>
                        </div>
                        <div className="user-stats">
                          <div className="user-bookings">
                            {formatNumber(user.bookingCount)} bookings
                          </div>
                          <div className="user-spent">
                            {formatCurrency(user.totalSpent)} spent
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostChargerAnalytics;
