import React, { useState, useEffect } from "react";
import { FaChartLine, FaDollarSign, FaMoneyBillWave, FaSpinner } from "react-icons/fa";
import axios from "axios";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import "../../../css/host-analytics.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const HostRevenueAnalytics = () => {
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("LAST_7_DAYS");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRevenueData();
  }, [period]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/analytics/host/revenue?period=${period}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setRevenueData(response.data);
    } catch (err) {
      console.error("Error fetching revenue data:", err);
      setError("Failed to load revenue analytics");
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

  const getRevenueLineData = () => {
    if (!revenueData?.dailyRevenue || revenueData.dailyRevenue.length === 0) {
      return null;
    }

    return {
      labels: revenueData.dailyRevenue.map(item => {
        if (item.label) return item.label;
        if (item.date) {
          const date = new Date(item.date);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        return '';
      }),
      datasets: [
        {
          label: 'Daily Revenue',
          data: revenueData.dailyRevenue.map(item => item.value || 0),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  };

  const getChargerRevenueData = () => {
    if (!revenueData?.revenueByCharger || revenueData.revenueByCharger.length === 0) {
      return null;
    }

    return {
      labels: revenueData.revenueByCharger.map(item => item.chargerName || 'Unknown'),
      datasets: [
        {
          label: 'Revenue by Charger',
          data: revenueData.revenueByCharger.map(item => item.revenue || 0),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return 'Revenue: ' + formatCurrency(context.parsed.y);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toFixed(2);
          }
        }
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return 'Revenue: ' + formatCurrency(context.parsed.y);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toFixed(0);
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <FaSpinner className="spinner" />
        <p>Loading revenue analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <p>{error}</p>
        <button onClick={fetchRevenueData} className="retry-btn">Retry</button>
      </div>
    );
  }

  const revenueLineData = getRevenueLineData();
  const chargerRevenueData = getChargerRevenueData();

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2><FaDollarSign /> Revenue Analytics</h2>
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
          <div className="card-icon spending">
            <FaDollarSign />
          </div>
          <div className="card-content">
            <h3>Current Period</h3>
            <p className="card-value">{formatCurrency(revenueData?.currentPeriodRevenue)}</p>
            <span className="card-label">Total revenue</span>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-icon">
            <FaMoneyBillWave />
          </div>
          <div className="card-content">
            <h3>Previous Period</h3>
            <p className="card-value">{formatCurrency(revenueData?.previousPeriodRevenue)}</p>
            <span className="card-label">Comparison baseline</span>
          </div>
        </div>

        {revenueData?.revenueComparison && (
          <div className="analytics-card">
            <div className="card-icon trend">
              <FaChartLine />
            </div>
            <div className="card-content">
              <h3>Change</h3>
              <p className={`card-value ${revenueData.revenueComparison.changePercentage >= 0 ? 'positive' : 'negative'}`}>
                {revenueData.revenueComparison.changePercentage >= 0 ? '+' : ''}
                {revenueData.revenueComparison.changePercentage?.toFixed(2)}%
              </p>
              <span className="card-label">vs previous period</span>
            </div>
          </div>
        )}
      </div>

      {/* Revenue Trend Chart */}
      {revenueLineData && (
        <div className="chart-container">
          <h3>Revenue Trend</h3>
          <div className="chart-wrapper" style={{ height: '350px' }}>
            <Line data={revenueLineData} options={lineChartOptions} />
          </div>
        </div>
      )}

      {/* Revenue by Charger */}
      <div className="analytics-row">
        {chargerRevenueData && (
          <div className="chart-container half">
            <h3>Revenue by Charger</h3>
            <div className="chart-wrapper" style={{ height: '300px' }}>
              <Bar data={chargerRevenueData} options={barChartOptions} />
            </div>
          </div>
        )}

        {/* Charger Revenue Table */}
        {revenueData?.revenueByCharger && revenueData.revenueByCharger.length > 0 && (
          <div className="table-container half">
            <h3>Charger Performance</h3>
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Charger</th>
                  <th>Revenue</th>
                  <th>Bookings</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {revenueData.revenueByCharger.map((charger, index) => (
                  <tr key={index}>
                    <td>{charger.chargerName}</td>
                    <td>{formatCurrency(charger.revenue)}</td>
                    <td>{charger.bookingCount || 0}</td>
                    <td>{charger.percentage?.toFixed(1) || 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Period Breakdown */}
      {(revenueData?.todayBreakdown || revenueData?.weekBreakdown || revenueData?.monthBreakdown) && (
        <div className="period-breakdown">
          <h3>Period Breakdown</h3>
          <div className="breakdown-grid">
            {revenueData.todayBreakdown && (
              <div className="breakdown-card">
                <h4>Today</h4>
                <p className="breakdown-value">{formatCurrency(revenueData.todayBreakdown.revenue)}</p>
                <span className="breakdown-label">{revenueData.todayBreakdown.bookings} bookings</span>
                {revenueData.todayBreakdown.changePercentage !== undefined && (
                  <span className={`breakdown-change ${revenueData.todayBreakdown.changePercentage >= 0 ? 'positive' : 'negative'}`}>
                    {revenueData.todayBreakdown.changePercentage >= 0 ? '+' : ''}
                    {revenueData.todayBreakdown.changePercentage.toFixed(1)}%
                  </span>
                )}
              </div>
            )}

            {revenueData.weekBreakdown && (
              <div className="breakdown-card">
                <h4>This Week</h4>
                <p className="breakdown-value">{formatCurrency(revenueData.weekBreakdown.revenue)}</p>
                <span className="breakdown-label">{revenueData.weekBreakdown.bookings} bookings</span>
                {revenueData.weekBreakdown.changePercentage !== undefined && (
                  <span className={`breakdown-change ${revenueData.weekBreakdown.changePercentage >= 0 ? 'positive' : 'negative'}`}>
                    {revenueData.weekBreakdown.changePercentage >= 0 ? '+' : ''}
                    {revenueData.weekBreakdown.changePercentage.toFixed(1)}%
                  </span>
                )}
              </div>
            )}

            {revenueData.monthBreakdown && (
              <div className="breakdown-card">
                <h4>This Month</h4>
                <p className="breakdown-value">{formatCurrency(revenueData.monthBreakdown.revenue)}</p>
                <span className="breakdown-label">{revenueData.monthBreakdown.bookings} bookings</span>
                {revenueData.monthBreakdown.changePercentage !== undefined && (
                  <span className={`breakdown-change ${revenueData.monthBreakdown.changePercentage >= 0 ? 'positive' : 'negative'}`}>
                    {revenueData.monthBreakdown.changePercentage >= 0 ? '+' : ''}
                    {revenueData.monthBreakdown.changePercentage.toFixed(1)}%
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!revenueData?.dailyRevenue || revenueData.dailyRevenue.length === 0) && (
        <div className="empty-state">
          <FaDollarSign size={48} color="#ccc" />
          <p>No revenue data available for this period.</p>
          <p>Revenue will appear once you have completed bookings.</p>
        </div>
      )}
    </div>
  );
};

export default HostRevenueAnalytics;