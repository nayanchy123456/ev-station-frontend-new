import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
import "../../../css/analytics.css";
import { FaCalendar, FaSpinner, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const UserBookingAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("LAST_7_DAYS");
  const [bookingData, setBookingData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookingData();
  }, [period]);

  const fetchBookingData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/analytics/user/bookings?period=${period}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setBookingData(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching booking data:", err);
      setError("Failed to load booking analytics");
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

  const formatDuration = (hours) => {
    return `${(hours || 0).toFixed(2)} hrs`;
  };

  const getStatusColor = (status) => {
    switch(status?.toUpperCase()) {
      case 'COMPLETED': return '#28a745';
      case 'CANCELLED': return '#dc3545';
      case 'PENDING': return '#ffc107';
      case 'CONFIRMED': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  const getBookingStatusData = () => {
    if (!bookingData?.bookingStatusDistribution || bookingData.bookingStatusDistribution.length === 0) {
      return null;
    }

    const labels = bookingData.bookingStatusDistribution.map(item => item.label || 'Unknown');
    const data = bookingData.bookingStatusDistribution.map(item => item.count || item.value || 0);
    const colors = labels.map(label => getStatusColor(label));

    return {
      labels: labels,
      datasets: [
        {
          label: 'Bookings by Status',
          data: data,
          backgroundColor: colors.map(color => color + '99'), // Add transparency
          borderColor: colors,
          borderWidth: 1
        }
      ]
    };
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right"
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const dataset = context.dataset;
            const total = dataset.data.reduce((acc, val) => acc + val, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <FaSpinner className="spinner" />
        <p>Loading booking analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <p>{error}</p>
        <button onClick={fetchBookingData} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  const statusChartData = getBookingStatusData();

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>
          <FaCalendar /> Booking Analytics
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
      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="card-icon bookings">
            <FaCalendar />
          </div>
          <div className="card-content">
            <h3>Total Bookings</h3>
            <p className="card-value">{bookingData?.totalBookings || 0}</p>
            <span className="card-label">All bookings</span>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-icon" style={{backgroundColor: '#28a745'}}>
            <FaCheckCircle />
          </div>
          <div className="card-content">
            <h3>Completed</h3>
            <p className="card-value">{bookingData?.completedBookings || 0}</p>
            <span className="card-label">Successful sessions</span>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-icon" style={{backgroundColor: '#dc3545'}}>
            <FaTimesCircle />
          </div>
          <div className="card-content">
            <h3>Cancelled</h3>
            <p className="card-value">{bookingData?.cancelledBookings || 0}</p>
            <span className="card-label">Cancelled bookings</span>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-icon" style={{backgroundColor: '#17a2b8'}}>
            <FaClock />
          </div>
          <div className="card-content">
            <h3>Upcoming</h3>
            <p className="card-value">{bookingData?.upcomingBookings || 0}</p>
            <span className="card-label">Scheduled sessions</span>
          </div>
        </div>
      </div>

      {/* Booking Status Distribution */}
      <div className="analytics-row">
        {statusChartData && (
          <div className="chart-container half">
            <h3>Booking Status Distribution</h3>
            <div className="chart-wrapper" style={{ height: '300px' }}>
              <Pie data={statusChartData} options={pieOptions} />
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="stats-container half">
          <h3>Booking Statistics</h3>
          <div className="stats-list">
            <div className="stat-row">
              <span className="stat-label">Completion Rate</span>
              <span className="stat-value">
                {bookingData?.totalBookings > 0
                  ? ((bookingData.completedBookings / bookingData.totalBookings) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Cancellation Rate</span>
              <span className="stat-value">
                {bookingData?.totalBookings > 0
                  ? ((bookingData.cancelledBookings / bookingData.totalBookings) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Total Bookings</span>
              <span className="stat-value">{bookingData?.totalBookings || 0}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Upcoming Sessions</span>
              <span className="stat-value">{bookingData?.upcomingBookings || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      {bookingData?.recentBookings && bookingData.recentBookings.length > 0 && (
        <div className="table-container">
          <h3>Recent Bookings</h3>
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Charger</th>
                <th>Duration</th>
                <th>Cost</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookingData.recentBookings.map((booking, index) => (
                <tr key={index}>
                  <td>
                    {booking.date 
                      ? new Date(booking.date).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'N/A'}
                  </td>
                  <td>{booking.chargerName || 'Unknown'}</td>
                  <td>{formatDuration(booking.duration)}</td>
                  <td>{formatCurrency(booking.cost)}</td>
                  <td>
                    <span 
                      className="status-badge" 
                      style={{ 
                        backgroundColor: getStatusColor(booking.status),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.85em'
                      }}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {(!bookingData?.recentBookings || bookingData.recentBookings.length === 0) && (
        <div className="empty-state">
          <FaCalendar size={48} color="#ccc" />
          <p>No booking data available for this period.</p>
          <p>Start booking chargers to see your booking history!</p>
        </div>
      )}
    </div>
  );
};

export default UserBookingAnalytics;