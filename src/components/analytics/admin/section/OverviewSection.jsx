import { useState, useEffect } from "react";
import { Users, Building2, Zap, Calendar, DollarSign, Star, CheckCircle, Clock } from "lucide-react";
import "../../../../services/charRegistration.js";
import { getAdminOverview, formatCurrency, formatNumber, formatPercentage } from "../../../../services/adminAnalyticsService";
import MetricCard from "../components/MetricCard";
import ChartCard from "../components/ChartCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { Line } from "react-chartjs-2";

const OverviewSection = ({ startDate, endDate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchOverviewData(); }, [startDate, endDate]);

  const fetchOverviewData = async () => {
    try {
      setLoading(true); setError(null);
      const response = await getAdminOverview(startDate, endDate);
      setData(response);
    } catch (err) {
      setError("Failed to load overview analytics. Please try again.");
    } finally { setLoading(false); }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchOverviewData} />;
  if (!data) return null;

  const revenueTrendData = {
    labels: data.revenueTrend?.map((p) => p.date) || [],
    datasets: [{ label: "Revenue", data: data.revenueTrend?.map((p) => Number(p.value) || 0) || [],
      borderColor: "rgb(59,130,246)", backgroundColor: "rgba(59,130,246,0.1)", fill: true, tension: 0.4 }],
  };

  const bookingTrendData = {
    labels: data.bookingTrend?.map((p) => p.date) || [],
    datasets: [{ label: "Bookings", data: data.bookingTrend?.map((p) => p.count) || [],
      borderColor: "rgb(16,185,129)", backgroundColor: "rgba(16,185,129,0.1)", fill: true, tension: 0.4 }],
  };

  const userGrowthData = {
    labels: data.userGrowthTrend?.map((p) => p.date) || [],
    datasets: [{ label: "Users", data: data.userGrowthTrend?.map((p) => p.count) || [],
      borderColor: "rgb(139,92,246)", backgroundColor: "rgba(139,92,246,0.1)", fill: true, tension: 0.4 }],
  };

  const chartOptions = { responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } };

  return (
    <div className="overview-section">
      <div className="metrics-grid">
        <MetricCard title="Total Users" value={formatNumber(data.totalUsers)} icon={Users} color="blue"
          subtitle={`${formatNumber(data.newUsersLast30Days)} new in last 30 days`} />
        <MetricCard title="Total Hosts" value={formatNumber(data.totalHosts)} icon={Building2} color="purple"
          subtitle={`${formatNumber(data.pendingHostApprovals)} pending approvals`} />
        <MetricCard title="Total Chargers" value={formatNumber(data.totalChargers)} icon={Zap} color="yellow"
          subtitle="Registered chargers" />
        <MetricCard title="Active Bookings" value={formatNumber(data.activeBookings)} icon={Calendar} color="green"
          subtitle={`${formatNumber(data.todaysBookings)} today`} />
        <MetricCard title="Total Revenue" value={formatCurrency(data.totalRevenue)} icon={DollarSign} color="emerald"
          subtitle={`${formatCurrency(data.thisWeekRevenue)} this week`} />
        <MetricCard title="Average Rating" value={data.averageRating?.toFixed(2) || "0.00"} icon={Star} color="amber"
          subtitle="Platform rating" />
        <MetricCard title="Completion Rate" value={formatPercentage(data.completionRate)} icon={CheckCircle} color="teal"
          subtitle="Booking completion" />
        <MetricCard title="Pending Approvals" value={formatNumber(data.pendingHostApprovals)} icon={Clock} color="rose"
          subtitle="Host approvals awaiting" />
      </div>

      <div className="charts-grid">
        <ChartCard title="Revenue Trend"><Line data={revenueTrendData} options={chartOptions} /></ChartCard>
        <ChartCard title="Booking Trend"><Line data={bookingTrendData} options={chartOptions} /></ChartCard>
        <ChartCard title="User Growth Trend"><Line data={userGrowthData} options={chartOptions} /></ChartCard>
      </div>

      <ChartCard title="Quick Stats Summary">
        <div className="performance-stats">
          <div className="stat-item"><span className="stat-label">Today's Bookings:</span><span className="stat-value">{formatNumber(data.todaysBookings)}</span></div>
          <div className="stat-item"><span className="stat-label">This Week Revenue:</span><span className="stat-value">{formatCurrency(data.thisWeekRevenue)}</span></div>
          <div className="stat-item"><span className="stat-label">New Users (30 days):</span><span className="stat-value">{formatNumber(data.newUsersLast30Days)}</span></div>
          <div className="stat-item"><span className="stat-label">Completion Rate:</span><span className="stat-value">{formatPercentage(data.completionRate)}</span></div>
        </div>
      </ChartCard>
    </div>
  );
};
export default OverviewSection;
