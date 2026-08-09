import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
import "../../../css/analytics.css";
import { FaBolt, FaSpinner, FaClock, FaChargingStation, FaMapMarkerAlt } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const UserChargingBehavior = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("LAST_7_DAYS");
  const [behaviorData, setBehaviorData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBehaviorData();
  }, [period]);

  const fetchBehaviorData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/analytics/user/charging-behavior?period=${period}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setBehaviorData(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching behavior data:", err);
      setError("Failed to load charging behavior analytics");
    } finally {
      setLoading(false);
    }
  };

  const formatEnergy = (kwh) => {
    return `${(kwh || 0).toFixed(2)} kWh`;
  };

  const formatDuration = (hours) => {
    return `${(hours || 0).toFixed(2)} hrs`;
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'NPR 0.00';
    const formatted = new Intl.NumberFormat('en-NP', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `NPR ${formatted}`;
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top"
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right"
      }
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <FaSpinner className="spinner" />
        <p>Loading charging behavior...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <p>{error}</p>
        <button onClick={fetchBehaviorData} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>
          <FaBolt /> Charging Behavior Analytics
        </h2>
        <div className="period-selector">
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="LAST_7_DAYS">Last 7 Days</option>
            <option value="LAST_30_DAYS">Last 30 Days</option>
            <option value="ALL_TIME">All Time</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {behaviorData?.chargingPatterns && (
        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="card-icon energy">
              <FaBolt />
            </div>
            <div className="card-content">
              <h3>Total Energy</h3>
              <p className="card-value">
                {formatEnergy(behaviorData.chargingPatterns.totalEnergyConsumed)}
              </p>
              <span className="card-label">Energy consumed</span>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-icon">
              <FaBolt />
            </div>
            <div className="card-content">
              <h3>Avg Energy/Session</h3>
              <p className="card-value">
                {formatEnergy(behaviorData.chargingPatterns.averageEnergyPerSession)}
              </p>
              <span className="card-label">Per charging session</span>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-icon bookings">
              <FaClock />
            </div>
            <div className="card-content">
              <h3>Avg Session Time</h3>
              <p className="card-value">
                {formatDuration(behaviorData.chargingPatterns.averageSessionDuration)}
              </p>
              <span className="card-label">Average duration</span>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-icon trend">
              <FaClock />
            </div>
            <div className="card-content">
              <h3>Peak Charging</h3>
              <p className="card-value">
                {behaviorData.chargingPatterns.peakChargingHour !== undefined 
                  ? `${behaviorData.chargingPatterns.peakChargingHour}:00`
                  : 'N/A'}
              </p>
              <span className="card-label">
                {behaviorData.chargingPatterns.peakChargingDay || 'Most active hour'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Most Visited Chargers */}
      {behaviorData?.mostVisitedChargers && behaviorData.mostVisitedChargers.length > 0 && (
        <div className="table-container">
          <h3><FaChargingStation /> Most Visited Chargers</h3>
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Charger</th>
                <th>Brand</th>
                <th>Location</th>
                <th>Visits</th>
                <th>Total Spent</th>
                <th>Avg Rating</th>
                <th>Last Visit</th>
              </tr>
            </thead>
            <tbody>
              {behaviorData.mostVisitedChargers.map((charger, index) => (
                <tr key={index}>
                  <td>{charger.chargerName}</td>
                  <td>{charger.brand || 'N/A'}</td>
                  <td>
                    <FaMapMarkerAlt /> {charger.location || 'Unknown'}
                  </td>
                  <td>{charger.visits}</td>
                  <td>{formatCurrency(charger.totalSpent)}</td>
                  <td>
                    {charger.averageRatingGiven 
                      ? `${charger.averageRatingGiven.toFixed(1)} ⭐`
                      : 'Not rated'}
                  </td>
                  <td>
                    {charger.lastVisit 
                      ? new Date(charger.lastVisit).toLocaleDateString()
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Charging Insights */}
      {behaviorData?.chargingPatterns && (
        <div className="insights-section">
          <h3>Charging Insights</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <h4>Peak Charging Time</h4>
              <p className="insight-value">
                {behaviorData.chargingPatterns.peakChargingHour !== undefined
                  ? `${behaviorData.chargingPatterns.peakChargingHour}:00 - ${behaviorData.chargingPatterns.peakChargingHour + 1}:00`
                  : 'Not enough data'}
              </p>
              <span className="insight-label">Your most active charging hour</span>
            </div>

            <div className="insight-card">
              <h4>Peak Charging Day</h4>
              <p className="insight-value">
                {behaviorData.chargingPatterns.peakChargingDay || 'Not enough data'}
              </p>
              <span className="insight-label">Your most active day</span>
            </div>

            <div className="insight-card">
              <h4>Total Sessions</h4>
              <p className="insight-value">
                {behaviorData.mostVisitedChargers?.reduce((sum, c) => sum + (c.visits || 0), 0) || 0}
              </p>
              <span className="insight-label">Across all chargers</span>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!behaviorData?.mostVisitedChargers || behaviorData.mostVisitedChargers.length === 0) && (
        <div className="empty-state">
          <FaBolt size={48} color="#ccc" />
          <p>No charging behavior data available for this period.</p>
          <p>Start charging to see your behavior patterns!</p>
        </div>
      )}
    </div>
  );
};

export default UserChargingBehavior;