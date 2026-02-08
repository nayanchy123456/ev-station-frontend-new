import React, { useState, useEffect } from "react";
import {
  FaClipboardList,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  getHostBookings,
  formatCurrency,
  formatNumber,
} from "../../../services/analyticsService";
import { DonutChartComponent } from "../ChartComponents";
import "../../../css/host-analytics.css";

const HostBookingAnalytics = () => {
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("LAST_7_DAYS");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookingData();
  }, [period]);

  const fetchBookingData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getHostBookings(period);
      setBookingData(data);
    } catch (err) {
      console.error("Error fetching booking data:", err);
      setError("Failed to load booking analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading booking analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchBookingData} className="btn-retry">
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
          <h2>Booking Analytics</h2>
          <p className="analytics-subtitle">Monitor your booking status and trends</p>
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

      {/* Booking Stats Cards */}
      <div className="booking-stats-grid">
        <div className="booking-stat-card total">
          <FaClipboardList className="booking-stat-icon" />
          <div className="booking-stat-info">
            <h3>{formatNumber(bookingData?.totalBookings)}</h3>
            <p>Total Bookings</p>
          </div>
        </div>

        <div className="booking-stat-card completed">
          <FaCheckCircle className="booking-stat-icon" />
          <div className="booking-stat-info">
            <h3>{formatNumber(bookingData?.completedBookings)}</h3>
            <p>Completed</p>
            <span className="stat-percentage">
              {bookingData?.completionRate?.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="booking-stat-card cancelled">
          <FaTimesCircle className="booking-stat-icon" />
          <div className="booking-stat-info">
            <h3>{formatNumber(bookingData?.cancelledBookings)}</h3>
            <p>Cancelled</p>
            <span className="stat-percentage">
              {bookingData?.cancellationRate?.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="booking-stat-card expired">
          <FaClock className="booking-stat-icon" />
          <div className="booking-stat-info">
            <h3>{formatNumber(bookingData?.expiredBookings)}</h3>
            <p>Expired</p>
            <span className="stat-percentage">
              {bookingData?.expirationRate?.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="booking-stat-card active">
          <FaExclamationTriangle className="booking-stat-icon" />
          <div className="booking-stat-info">
            <h3>{formatNumber(bookingData?.activeBookings)}</h3>
            <p>Active</p>
          </div>
        </div>
      </div>

      {/* Booking Status Distribution Chart */}
      {bookingData?.bookingStatusDistribution && bookingData.bookingStatusDistribution.length > 0 && (
        <div className="chart-section">
          <DonutChartComponent
            data={bookingData.bookingStatusDistribution}
            title="Booking Status Distribution"
          />
        </div>
      )}

      {/* Expired Bookings Analysis */}
      {bookingData?.expiredAnalysis && (
        <div className="expired-analysis-section">
          <h3 className="section-title">
            <FaClock /> Expired Bookings Analysis
          </h3>
          
          <div className="expired-summary">
            <div className="expired-summary-card">
              <div className="summary-label">Total Expired</div>
              <div className="summary-value">
                {formatNumber(bookingData.expiredAnalysis.totalExpiredCount)}
              </div>
            </div>
            <div className="expired-summary-card danger">
              <div className="summary-label">Total Lost Revenue</div>
              <div className="summary-value">
                {formatCurrency(bookingData.expiredAnalysis.totalLostRevenue)}
              </div>
            </div>
          </div>

          <div className="expired-periods-grid">
            {bookingData.expiredAnalysis.thisWeek && (
              <div className="expired-period-card">
                <h4>This Week</h4>
                <div className="period-stats">
                  <div className="period-stat">
                    <span className="stat-label">Expired Count:</span>
                    <span className="stat-value">
                      {formatNumber(bookingData.expiredAnalysis.thisWeek.expiredCount)}
                    </span>
                  </div>
                  <div className="period-stat">
                    <span className="stat-label">Lost Revenue:</span>
                    <span className="stat-value text-danger">
                      {formatCurrency(bookingData.expiredAnalysis.thisWeek.lostRevenue)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {bookingData.expiredAnalysis.thisMonth && (
              <div className="expired-period-card">
                <h4>This Month</h4>
                <div className="period-stats">
                  <div className="period-stat">
                    <span className="stat-label">Expired Count:</span>
                    <span className="stat-value">
                      {formatNumber(bookingData.expiredAnalysis.thisMonth.expiredCount)}
                    </span>
                  </div>
                  <div className="period-stat">
                    <span className="stat-label">Lost Revenue:</span>
                    <span className="stat-value text-danger">
                      {formatCurrency(bookingData.expiredAnalysis.thisMonth.lostRevenue)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {bookingData.expiredAnalysis.allTime && (
              <div className="expired-period-card">
                <h4>All Time</h4>
                <div className="period-stats">
                  <div className="period-stat">
                    <span className="stat-label">Expired Count:</span>
                    <span className="stat-value">
                      {formatNumber(bookingData.expiredAnalysis.allTime.expiredCount)}
                    </span>
                  </div>
                  <div className="period-stat">
                    <span className="stat-label">Lost Revenue:</span>
                    <span className="stat-value text-danger">
                      {formatCurrency(bookingData.expiredAnalysis.allTime.lostRevenue)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Key Metrics Summary */}
      <div className="metrics-summary">
        <h3 className="section-title">Key Metrics</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Completion Rate</div>
            <div className="metric-value success">
              {bookingData?.completionRate?.toFixed(1)}%
            </div>
            <div className="metric-description">
              {formatNumber(bookingData?.completedBookings)} of{" "}
              {formatNumber(bookingData?.totalBookings)} bookings completed
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Cancellation Rate</div>
            <div className="metric-value warning">
              {bookingData?.cancellationRate?.toFixed(1)}%
            </div>
            <div className="metric-description">
              {formatNumber(bookingData?.cancelledBookings)} bookings cancelled
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Expiration Rate</div>
            <div className="metric-value danger">
              {bookingData?.expirationRate?.toFixed(1)}%
            </div>
            <div className="metric-description">
              {formatNumber(bookingData?.expiredBookings)} bookings expired
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostBookingAnalytics;
