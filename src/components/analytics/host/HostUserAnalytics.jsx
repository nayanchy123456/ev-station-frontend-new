import React, { useState, useEffect } from "react";
import { FaUsers, FaUserPlus, FaUserCheck, FaStar } from "react-icons/fa";
import {
  getHostUsers,
  formatCurrency,
  formatNumber,
} from "../../../services/analyticsService";
import "../../../css/host-analytics.css";

const HostUserAnalytics = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("LAST_7_DAYS");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, [period]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getHostUsers(period);
      setUserData(data);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load user analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading user analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchUserData} className="btn-retry">
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
          <h2>User Analytics</h2>
          <p className="analytics-subtitle">Understand your customer behavior</p>
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

      {/* User Stats Cards */}
      <div className="stats-grid">
        <div className="user-stat-card">
          <FaUsers className="user-stat-icon" />
          <div className="user-stat-info">
            <h3>{formatNumber(userData?.totalActiveUsers)}</h3>
            <p>Total Active Users</p>
          </div>
        </div>

        <div className="user-stat-card new">
          <FaUserPlus className="user-stat-icon" />
          <div className="user-stat-info">
            <h3>{formatNumber(userData?.newUsers)}</h3>
            <p>New Users</p>
          </div>
        </div>

        <div className="user-stat-card returning">
          <FaUserCheck className="user-stat-icon" />
          <div className="user-stat-info">
            <h3>{formatNumber(userData?.returningUsers)}</h3>
            <p>Returning Users</p>
          </div>
        </div>
      </div>

      {/* Top Frequent Users */}
      {userData?.topFrequentUsers && userData.topFrequentUsers.length > 0 && (
        <div className="table-section">
          <h3 className="section-title">
            <FaStar /> Top Frequent Customers
          </h3>
          <div className="table-container">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Total Bookings</th>
                  <th>Total Spent</th>
                  <th>Favorite Charger</th>
                  <th>Visits</th>
                </tr>
              </thead>
              <tbody>
                {userData.topFrequentUsers.map((user, index) => (
                  <tr key={user.userId}>
                    <td>
                      <div className="rank-badge">#{index + 1}</div>
                    </td>
                    <td>
                      <strong>{user.userName}</strong>
                    </td>
                    <td>{user.userEmail}</td>
                    <td>{formatNumber(user.totalBookings)}</td>
                    <td className="text-success">{formatCurrency(user.totalSpent)}</td>
                    <td>
                      {user.favoriteChargerName || "N/A"}
                    </td>
                    <td>{formatNumber(user.favoriteChargerVisits)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User-Charger Affinity */}
      {userData?.userChargerAffinity && userData.userChargerAffinity.length > 0 && (
        <div className="table-section">
          <h3 className="section-title">User-Charger Affinity</h3>
          <p className="section-description">
            Shows which users prefer which chargers based on booking patterns
          </p>
          <div className="table-container">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Charger</th>
                  <th>Bookings</th>
                  <th>Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {userData.userChargerAffinity.map((affinity, index) => (
                  <tr key={index}>
                    <td>
                      <strong>{affinity.userName}</strong>
                    </td>
                    <td>{affinity.chargerName}</td>
                    <td>{formatNumber(affinity.bookingCount)}</td>
                    <td className="text-success">{formatCurrency(affinity.totalSpent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostUserAnalytics;
