import React, { useState, useEffect } from "react";
import {
  FaDollarSign,
  FaUsers,
  FaChargingStation,
  FaStar,
  FaClipboardList,
  FaCheckCircle,
} from "react-icons/fa";
import { getHostOverview, getTrendInfo, formatCurrency, formatNumber } from "../../../services/analyticsService";
import { StatCard } from "../ChartComponents";
import "../../../css/host-analytics.css";

const HostAnalyticsDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("LAST_7_DAYS");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOverview();
  }, [period]);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getHostOverview(period);
      setOverview(data);
    } catch (err) {
      console.error("Error fetching host overview:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const getPeriodLabel = () => {
    switch (period) {
      case "LAST_7_DAYS":
        return "Last 7 Days";
      case "LAST_30_DAYS":
        return "Last 30 Days";
      case "ALL_TIME":
        return "All Time";
      default:
        return "Last 7 Days";
    }
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="analytics-header">
          <h2>Analytics Dashboard</h2>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-container">
        <div className="analytics-header">
          <h2>Analytics Dashboard</h2>
        </div>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchOverview} className="btn-retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      {/* Header with Period Selector */}
      <div className="analytics-header">
        <div>
          <h2>Analytics Dashboard</h2>
          <p className="analytics-subtitle">Track your charging station performance</p>
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

      {/* KPI Cards Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(overview?.totalRevenue)}
          subtitle={getPeriodLabel()}
          trend={getTrendInfo(overview?.revenueComparison)}
          icon={<FaDollarSign />}
          color="green"
        />

        <StatCard
          title="Active Users"
          value={formatNumber(overview?.activeUsers)}
          subtitle="Unique customers"
          trend={getTrendInfo(overview?.activeUsersComparison)}
          icon={<FaUsers />}
          color="blue"
        />

        <StatCard
          title="Total Chargers"
          value={formatNumber(overview?.totalChargers)}
          subtitle="Active stations"
          icon={<FaChargingStation />}
          color="purple"
        />

        <StatCard
          title="Average Rating"
          value={overview?.averageRating ? `${overview.averageRating.toFixed(1)} ★` : "N/A"}
          subtitle="Customer satisfaction"
          icon={<FaStar />}
          color="orange"
        />

        <StatCard
          title="Total Bookings"
          value={formatNumber(overview?.totalBookings)}
          subtitle={getPeriodLabel()}
          trend={getTrendInfo(overview?.bookingsComparison)}
          icon={<FaClipboardList />}
          color="indigo"
        />

        <StatCard
          title="Completion Rate"
          value={overview?.completionRate ? `${overview.completionRate.toFixed(1)}%` : "0%"}
          subtitle={`${formatNumber(overview?.completedBookings)} completed`}
          icon={<FaCheckCircle />}
          color="teal"
        />
      </div>

      {/* Quick Summary Section */}
      <div className="summary-section">
        <div className="summary-card">
          <h3>Performance Summary</h3>
          <div className="summary-content">
            <div className="summary-item">
              <span className="summary-label">Total Bookings:</span>
              <span className="summary-value">{formatNumber(overview?.totalBookings)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Completed:</span>
              <span className="summary-value success">
                {formatNumber(overview?.completedBookings)}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Completion Rate:</span>
              <span className="summary-value">
                {overview?.completionRate?.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <h3>Revenue Insights</h3>
          <div className="summary-content">
            <div className="summary-item">
              <span className="summary-label">Current Period:</span>
              <span className="summary-value">{formatCurrency(overview?.totalRevenue)}</span>
            </div>
            {overview?.revenueComparison && (
              <>
                <div className="summary-item">
                  <span className="summary-label">Previous Period:</span>
                  <span className="summary-value">
                    {formatCurrency(overview.revenueComparison.previousValue)}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Change:</span>
                  <span
                    className={`summary-value ${
                      overview.revenueComparison.isIncrease ? "success" : "danger"
                    }`}
                  >
                    {overview.revenueComparison.isIncrease ? "+" : ""}
                    {formatCurrency(overview.revenueComparison.changeAmount)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Hint */}
      <div className="navigation-hint">
        <p>
          Explore detailed analytics in <strong>Revenue</strong>, <strong>Chargers</strong>,{" "}
          <strong>Bookings</strong>, and <strong>Users</strong> sections from the sidebar.
        </p>
      </div>
    </div>
  );
};

export default HostAnalyticsDashboard;
