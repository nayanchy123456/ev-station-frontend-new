import { useState, useEffect } from "react";
import { Activity, TrendingUp, Users, Target, Bell, Zap } from "lucide-react";
import "../../../../services/charRegistration.js";
import { getAdminPlatformPerformance, formatNumber, formatPercentage } from "../../../../services/adminAnalyticsService";
import MetricCard from "../components/MetricCard";
import ChartCard from "../components/ChartCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { Bar, Radar } from "react-chartjs-2";

const PlatformPerformanceSection = ({ startDate, endDate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchPlatformPerformance(); }, [startDate, endDate]);

  const fetchPlatformPerformance = async () => {
    try {
      setLoading(true); setError(null);
      const response = await getAdminPlatformPerformance(startDate, endDate);
      setData(response);
    } catch (err) {
      setError("Failed to load platform performance data. Please try again.");
    } finally { setLoading(false); }
  };

  if (loading) return <LoadingSpinner message="Loading platform performance..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchPlatformPerformance} />;
  if (!data) return null;

  // Backend: dailyActiveUsers, weeklyActiveUsers, monthlyActiveUsers
  const engagementData = {
    labels: ["Daily Active", "Weekly Active", "Monthly Active"],
    datasets: [{ label: "Active Users",
      data: [data.dailyActiveUsers || 0, data.weeklyActiveUsers || 0, data.monthlyActiveUsers || 0],
      backgroundColor: ["rgba(16,185,129,0.8)","rgba(59,130,246,0.8)","rgba(139,92,246,0.8)"] }],
  };

  // Backend: monthOverMonthGrowth.userGrowth, .hostGrowth, .bookingGrowth, .revenueGrowth
  const momData = {
    labels: ["User Growth", "Host Growth", "Booking Growth", "Revenue Growth"],
    datasets: [{ label: "Month-over-Month (%)",
      data: [
        data.monthOverMonthGrowth?.userGrowth || 0,
        data.monthOverMonthGrowth?.hostGrowth || 0,
        data.monthOverMonthGrowth?.bookingGrowth || 0,
        data.monthOverMonthGrowth?.revenueGrowth || 0,
      ],
      backgroundColor: ["rgba(59,130,246,0.8)","rgba(16,185,129,0.8)","rgba(245,158,11,0.8)","rgba(139,92,246,0.8)"] }],
  };

  // Backend: yearOverYearGrowth.userGrowth, .hostGrowth, .bookingGrowth, .revenueGrowth
  const yoyData = {
    labels: ["User Growth", "Host Growth", "Booking Growth", "Revenue Growth"],
    datasets: [{ label: "Year-over-Year (%)",
      data: [
        data.yearOverYearGrowth?.userGrowth || 0,
        data.yearOverYearGrowth?.hostGrowth || 0,
        data.yearOverYearGrowth?.bookingGrowth || 0,
        data.yearOverYearGrowth?.revenueGrowth || 0,
      ],
      backgroundColor: ["rgba(59,130,246,0.5)","rgba(16,185,129,0.5)","rgba(245,158,11,0.5)","rgba(139,92,246,0.5)"] }],
  };

  // Radar chart using available metrics
  const radarData = {
    labels: ["Platform Adoption", "User Conversion", "Notification Delivery", "DAU", "WAU", "MAU"],
    datasets: [{
      label: "Platform Health",
      data: [
        Math.min(data.platformAdoptionRate || 0, 100),
        Math.min(data.userToBookingConversionRate || 0, 100),
        Math.min(data.notificationDeliveryRate || 0, 100),
        Math.min(((data.dailyActiveUsers || 0) / Math.max(data.monthlyActiveUsers || 1, 1)) * 100, 100),
        Math.min(((data.weeklyActiveUsers || 0) / Math.max(data.monthlyActiveUsers || 1, 1)) * 100, 100),
        100,
      ],
      backgroundColor: "rgba(59,130,246,0.2)", borderColor: "rgb(59,130,246)", borderWidth: 2,
    }],
  };

  const chartOptions = { responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } };
  const barLegendOptions = { responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: true, position: "top" } }, scales: { y: { beginAtZero: true } } };
  const radarOptions = { responsive: true, maintainAspectRatio: false,
    scales: { r: { beginAtZero: true, max: 100 } }, plugins: { legend: { display: false } } };

  const GrowthCard = ({ label, value }) => (
    <div className={`growth-card ${(value || 0) >= 0 ? "positive" : "negative"}`}>
      <div className="growth-label">{label}</div>
      <div className="growth-value">{(value || 0) >= 0 ? "+" : ""}{formatPercentage(value)}</div>
    </div>
  );

  return (
    <div className="platform-performance-section">
      <div className="metrics-grid">
        {/* Backend: totalTransactionsProcessed */}
        <MetricCard title="Total Transactions" value={formatNumber(data.totalTransactionsProcessed)} icon={Activity} color="blue" subtitle="All-time processed" />
        {/* Backend: totalNotificationsSent */}
        <MetricCard title="Notifications Sent" value={formatNumber(data.totalNotificationsSent)} icon={Bell} color="purple" subtitle="All-time sent" />
        {/* Backend: dailyActiveUsers */}
        <MetricCard title="Daily Active Users" value={formatNumber(data.dailyActiveUsers)} icon={Users} color="green" subtitle="Last 24 hours" />
        {/* Backend: weeklyActiveUsers */}
        <MetricCard title="Weekly Active Users" value={formatNumber(data.weeklyActiveUsers)} icon={Users} color="amber" subtitle="Last 7 days" />
        {/* Backend: monthlyActiveUsers */}
        <MetricCard title="Monthly Active Users" value={formatNumber(data.monthlyActiveUsers)} icon={Users} color="teal" subtitle="Last 30 days" />
        {/* Backend: notificationDeliveryRate */}
        <MetricCard title="Notification Delivery" value={formatPercentage(data.notificationDeliveryRate)} icon={Bell} color="rose" subtitle="Delivery success rate" />
        {/* Backend: platformAdoptionRate */}
        <MetricCard title="Platform Adoption Rate" value={formatPercentage(data.platformAdoptionRate)} icon={Target} color="indigo" subtitle="Active user ratio" />
        {/* Backend: userToBookingConversionRate */}
        <MetricCard title="User→Booking Conversion" value={formatPercentage(data.userToBookingConversionRate)} icon={Zap} color="orange" subtitle="Conversion rate" />
      </div>

      <div className="charts-grid">
        <ChartCard title="Platform Health Radar">
          <Radar data={radarData} options={radarOptions} />
        </ChartCard>
        <ChartCard title="User Engagement (Active Users)">
          <Bar data={engagementData} options={chartOptions} />
        </ChartCard>
        <ChartCard title="Month-over-Month Growth (%)">
          <Bar data={momData} options={barLegendOptions} />
        </ChartCard>
        <ChartCard title="Year-over-Year Growth (%)">
          <Bar data={yoyData} options={barLegendOptions} />
        </ChartCard>
      </div>

      {/* Backend: monthOverMonthGrowth */}
      {data.monthOverMonthGrowth && (
        <ChartCard title="Month-over-Month Growth">
          <div className="growth-metrics-grid">
            <GrowthCard label="👥 User Growth" value={data.monthOverMonthGrowth.userGrowth} />
            <GrowthCard label="🏢 Host Growth" value={data.monthOverMonthGrowth.hostGrowth} />
            <GrowthCard label="📚 Booking Growth" value={data.monthOverMonthGrowth.bookingGrowth} />
            <GrowthCard label="💰 Revenue Growth" value={data.monthOverMonthGrowth.revenueGrowth} />
          </div>
        </ChartCard>
      )}

      {/* Backend: yearOverYearGrowth */}
      {data.yearOverYearGrowth && (
        <ChartCard title="Year-over-Year Growth">
          <div className="growth-metrics-grid">
            <GrowthCard label="👥 User Growth" value={data.yearOverYearGrowth.userGrowth} />
            <GrowthCard label="🏢 Host Growth" value={data.yearOverYearGrowth.hostGrowth} />
            <GrowthCard label="📚 Booking Growth" value={data.yearOverYearGrowth.bookingGrowth} />
            <GrowthCard label="💰 Revenue Growth" value={data.yearOverYearGrowth.revenueGrowth} />
          </div>
        </ChartCard>
      )}

      {/* Platform summary stats */}
      <ChartCard title="Platform Summary">
        <div className="performance-stats">
          <div className="stat-item"><span className="stat-label">Platform Adoption Rate:</span><span className="stat-value">{formatPercentage(data.platformAdoptionRate)}</span></div>
          <div className="stat-item"><span className="stat-label">User to Booking Conversion:</span><span className="stat-value">{formatPercentage(data.userToBookingConversionRate)}</span></div>
          <div className="stat-item"><span className="stat-label">Notification Delivery Rate:</span><span className="stat-value">{formatPercentage(data.notificationDeliveryRate)}</span></div>
          <div className="stat-item"><span className="stat-label">Total Transactions Processed:</span><span className="stat-value">{formatNumber(data.totalTransactionsProcessed)}</span></div>
        </div>
      </ChartCard>
    </div>
  );
};
export default PlatformPerformanceSection;
