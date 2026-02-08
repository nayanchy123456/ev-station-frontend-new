import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../css/analytics.css';
import { FaCalendar, FaDollarSign, FaChargingStation, FaStar, FaSpinner } from 'react-icons/fa';

const UserAnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('LAST_7_DAYS');
  const [overviewData, setOverviewData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOverview();
  }, [period]);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8080/api/analytics/user/overview?period=${period}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setOverviewData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching overview:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'NPR 0.00';
    const formatted = new Intl.NumberFormat('en-NP', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `NPR ${formatted}`;
  };

  const formatEnergy = (kwh) => {
    return `${(kwh || 0).toFixed(2)} kWh`;
  };

  const formatDuration = (hours) => {
    return `${(hours || 0).toFixed(2)} hrs`;
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <FaSpinner className="spinner" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <p>{error}</p>
        <button onClick={fetchOverview} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>Analytics Overview</h2>
        <div className="period-selector">
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="LAST_7_DAYS">Last 7 Days</option>
            <option value="LAST_30_DAYS">Last 30 Days</option>
            <option value="ALL_TIME">All Time</option>
          </select>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Total Bookings Card */}
        <div className="analytics-card">
          <div className="card-icon bookings">
            <FaCalendar />
          </div>
          <div className="card-content">
            <h3>Total Bookings</h3>
            <p className="card-value">{overviewData?.totalBookings || 0}</p>
            <span className="card-label">Charging sessions</span>
          </div>
        </div>

        {/* Total Spending Card */}
        <div className="analytics-card">
          <div className="card-icon spending">
            <FaDollarSign />
          </div>
          <div className="card-content">
            <h3>Total Spending</h3>
            <p className="card-value">{formatCurrency(overviewData?.totalSpent)}</p>
            <span className="card-label">Amount paid</span>
          </div>
        </div>

        {/* Energy Consumed Card */}
        <div className="analytics-card">
          <div className="card-icon energy">
            <FaChargingStation />
          </div>
          <div className="card-content">
            <h3>Energy Consumed</h3>
            <p className="card-value">{formatEnergy(overviewData?.totalEnergyConsumed)}</p>
            <span className="card-label">Total charged</span>
          </div>
        </div>

        {/* Average Session Duration Card */}
        <div className="analytics-card">
          <div className="card-icon rating">
            <FaStar />
          </div>
          <div className="card-content">
            <h3>Avg Session Duration</h3>
            <p className="card-value">{formatDuration(overviewData?.averageSessionDuration)}</p>
            <span className="card-label">Per charging session</span>
          </div>
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className="quick-stats">
        <h3>Quick Stats</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Completed Bookings</span>
            <span className="stat-value">{overviewData?.completedBookings || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average Per Session</span>
            <span className="stat-value">{formatCurrency(overviewData?.averageSpendingPerSession)}</span>
          </div>
          {overviewData?.favoriteCharger && (
            <>
              <div className="stat-item">
                <span className="stat-label">Favorite Charger</span>
                <span className="stat-value">{overviewData.favoriteCharger.chargerName}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Visits to Favorite</span>
                <span className="stat-value">{overviewData.favoriteCharger.visits}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Comparison Section */}
      {(overviewData?.spendingComparison || overviewData?.bookingsComparison) && (
        <div className="comparison-section">
          <h3>Period Comparison</h3>
          <div className="comparison-grid">
            {overviewData.spendingComparison && (
              <div className="comparison-card">
                <h4>Spending Change</h4>
                <p className={`comparison-value ${overviewData.spendingComparison.changePercentage >= 0 ? 'positive' : 'negative'}`}>
                  {overviewData.spendingComparison.changePercentage >= 0 ? '+' : ''}
                  {overviewData.spendingComparison.changePercentage?.toFixed(2)}%
                </p>
                <span className="comparison-label">vs previous period</span>
              </div>
            )}
            {overviewData.bookingsComparison && (
              <div className="comparison-card">
                <h4>Bookings Change</h4>
                <p className={`comparison-value ${overviewData.bookingsComparison.changePercentage >= 0 ? 'positive' : 'negative'}`}>
                  {overviewData.bookingsComparison.changePercentage >= 0 ? '+' : ''}
                  {overviewData.bookingsComparison.changePercentage?.toFixed(2)}%
                </p>
                <span className="comparison-label">vs previous period</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Period Summary */}
      <div className="period-summary">
        <p>
          <strong>Period:</strong> {period.replace(/_/g, ' ').toLowerCase()}
        </p>
        <p className="summary-note">
          Use the navigation menu to explore detailed analytics for spending, charging behavior, bookings, and ratings.
        </p>
      </div>
    </div>
  );
};

export default UserAnalyticsDashboard;