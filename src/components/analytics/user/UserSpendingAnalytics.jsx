import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../css/analytics.css';
import { FaDollarSign, FaSpinner, FaCalendar, FaChartLine } from 'react-icons/fa';
import { SpendingAreaChart, PieChartComponent } from '../ChartComponents';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const UserSpendingAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('LAST_7_DAYS');
  const [spendingData, setSpendingData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSpendingData();
  }, [period]);

  const fetchSpendingData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/analytics/user/spending?period=${period}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('📊 Spending API Response:', response.data);
      console.log('📊 Daily Spending:', response.data?.dailySpending);
      console.log('📊 Spending by Charger:', response.data?.spendingByCharger);
      
      setSpendingData(response.data);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching spending data:', err);
      console.error('❌ Error details:', err.response?.data);
      setError('Failed to load spending analytics');
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

  if (loading) {
    return (
      <div className="analytics-loading">
        <FaSpinner className="spinner" />
        <p>Loading spending analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <p>{error}</p>
        <button onClick={fetchSpendingData} className="retry-btn">Retry</button>
      </div>
    );
  }

  // Transform data for pie chart
  const getPieChartData = () => {
    if (!spendingData?.spendingByCharger || spendingData.spendingByCharger.length === 0) {
      return null;
    }

    return spendingData.spendingByCharger.map(charger => ({
      label: charger.chargerName || 'Unknown Charger',
      count: charger.spent || 0,
      percentage: charger.percentage || 0
    }));
  };

  const pieChartData = getPieChartData();

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2><FaDollarSign /> Spending Analytics</h2>
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
            <p className="card-value">{formatCurrency(spendingData?.currentPeriodSpending)}</p>
            <span className="card-label">Total spending</span>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-icon">
            <FaDollarSign />
          </div>
          <div className="card-content">
            <h3>Average Per Session</h3>
            <p className="card-value">{formatCurrency(spendingData?.averageSpendingPerSession)}</p>
            <span className="card-label">Per charging session</span>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-icon bookings">
            <FaCalendar />
          </div>
          <div className="card-content">
            <h3>Total Sessions</h3>
            <p className="card-value">{spendingData?.totalSessions || 0}</p>
            <span className="card-label">Charging sessions</span>
          </div>
        </div>

        {spendingData?.spendingComparison && (
          <div className="analytics-card">
            <div className="card-icon trend">
              <FaChartLine />
            </div>
            <div className="card-content">
              <h3>Change</h3>
              <p className={`card-value ${spendingData.spendingComparison.changePercentage >= 0 ? 'positive' : 'negative'}`}>
                {spendingData.spendingComparison.changePercentage >= 0 ? '+' : ''}
                {spendingData.spendingComparison.changePercentage?.toFixed(2)}%
              </p>
              <span className="card-label">vs previous period</span>
            </div>
          </div>
        )}
      </div>

      {/* Spending Trend Chart using Recharts */}
      {spendingData?.dailySpending && spendingData.dailySpending.length > 0 ? (
        <SpendingAreaChart 
          data={spendingData.dailySpending}
          title="Spending Trend Over Time"
        />
      ) : (
        <div className="chart-container">
          <h3 className="chart-title">Spending Trend Over Time</h3>
          <div className="no-data-message">
            <p>No spending data available for this period. Start charging to see your spending trends!</p>
          </div>
        </div>
      )}

      {/* Charger Spending Breakdown */}
      <div className="analytics-row">
        {/* Pie Chart */}
        {pieChartData && pieChartData.length > 0 ? (
          <div className="chart-container half">
            <PieChartComponent 
              data={pieChartData}
              title="Spending Distribution by Charger"
            />
          </div>
        ) : (
          <div className="chart-container half">
            <h3 className="chart-title">Spending Distribution by Charger</h3>
            <div className="no-data-message">
              <p>No charger data available</p>
            </div>
          </div>
        )}

        {/* Charger Details Table */}
        {spendingData?.spendingByCharger && spendingData.spendingByCharger.length > 0 ? (
          <div className="table-container half">
            <h3>Charger Spending Details</h3>
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Charger</th>
                  <th>Sessions</th>
                  <th>Spent</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {spendingData.spendingByCharger.map((charger, index) => (
                  <tr key={index}>
                    <td>{charger.chargerName}</td>
                    <td>{charger.sessionCount || 0}</td>
                    <td>{formatCurrency(charger.spent)}</td>
                    <td>{charger.percentage?.toFixed(1) || 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-container half">
            <h3>Charger Spending Details</h3>
            <div className="no-data-message">
              <p>No charger usage data yet</p>
            </div>
          </div>
        )}
      </div>

      {/* Period Summary */}
      {spendingData?.previousPeriodSpending !== undefined && (
        <div className="period-summary">
          <p>
            <strong>Previous Period:</strong> {formatCurrency(spendingData.previousPeriodSpending)}
          </p>
          <p>
            <strong>Current Period:</strong> {formatCurrency(spendingData.currentPeriodSpending)}
          </p>
        </div>
      )}

      {/* Helpful Tip */}
      {(!spendingData?.dailySpending || spendingData.dailySpending.length === 0) && (
        <div className="helpful-tip">
          <p><strong>💡 Tip:</strong> Make some bookings to see your spending analytics and charts!</p>
        </div>
      )}
    </div>
  );
};

export default UserSpendingAnalytics;