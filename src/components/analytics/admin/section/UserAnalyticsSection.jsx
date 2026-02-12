import { useState, useEffect } from "react";
import { Users, Activity, TrendingUp, UserPlus, Percent } from "lucide-react";
import "../../../../services/charRegistration.js";
import { getAdminUserAnalytics, formatNumber, formatPercentage } from "../../../../services/adminAnalyticsService";
import MetricCard from "../components/MetricCard";
import ChartCard from "../components/ChartCard";
import DataTable from "../components/DataTable";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { Line, Bar, Doughnut } from "react-chartjs-2";

const UserAnalyticsSection = ({ startDate, endDate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchUserAnalytics(); }, [startDate, endDate]);

  const fetchUserAnalytics = async () => {
    try {
      setLoading(true); setError(null);
      const response = await getAdminUserAnalytics(startDate, endDate);
      setData(response);
    } catch (err) {
      setError("Failed to load user analytics. Please try again.");
    } finally { setLoading(false); }
  };

  if (loading) return <LoadingSpinner message="Loading user analytics..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchUserAnalytics} />;
  if (!data) return null;

  // Backend: userRegistrationTimeline[].date, [].count
  const registrationTrendData = {
    labels: data.userRegistrationTimeline?.map((p) => p.date) || [],
    datasets: [{ label: "New Users", data: data.userRegistrationTimeline?.map((p) => p.count) || [],
      borderColor: "rgb(139,92,246)", backgroundColor: "rgba(139,92,246,0.1)", fill: true, tension: 0.4 }],
  };

  // Backend: activityHeatmap[].dayOfWeek, [].hour, [].activityCount
  const activityData = {
    labels: data.activityHeatmap?.map((p) => `${p.dayOfWeek} ${p.hour}:00`) || [],
    datasets: [{ label: "Activity Count", data: data.activityHeatmap?.map((p) => p.activityCount) || [],
      backgroundColor: "rgba(59,130,246,0.8)" }],
  };

  // Backend: usersByRole.totalUsers, .hosts, .regularUsers
  const roleData = {
    labels: ["Regular Users", "Hosts"],
    datasets: [{ data: [data.usersByRole?.regularUsers || 0, data.usersByRole?.hosts || 0],
      backgroundColor: ["rgba(59,130,246,0.8)", "rgba(16,185,129,0.8)"] }],
  };

  // Backend: topActiveUsers[].userId, .name, .email, .bookingCount, .lastActive
  const topUsersColumns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "bookingCount", label: "Bookings", render: (v) => formatNumber(v) },
    { key: "lastActive", label: "Last Active", render: (v) => v ? new Date(v).toLocaleDateString() : "N/A" },
  ];

  const chartOptions = { responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } };
  const doughnutOptions = { responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" } } };

  return (
    <div className="user-analytics-section">
      <div className="metrics-grid">
        {/* Backend: totalRegisteredUsers */}
        <MetricCard title="Total Registered Users" value={formatNumber(data.totalRegisteredUsers)} icon={Users} color="blue" subtitle="All registered accounts" />
        {/* Backend: activeUsers */}
        <MetricCard title="Active Users" value={formatNumber(data.activeUsers)} icon={Activity} color="green" subtitle="Users with bookings" />
        {/* Backend: userGrowthRate */}
        <MetricCard title="User Growth Rate" value={formatPercentage(data.userGrowthRate)} icon={TrendingUp} color="purple" subtitle="Period growth" />
        {/* Backend: averageBookingsPerUser */}
        <MetricCard title="Avg Bookings / User" value={(data.averageBookingsPerUser || 0).toFixed(2)} icon={UserPlus} color="amber" subtitle="Per user metric" />
        {/* Backend: userRetentionRate */}
        <MetricCard title="User Retention Rate" value={formatPercentage(data.userRetentionRate)} icon={Percent} color="teal" subtitle="30-day retention" />
        {/* Backend: usersByRole.hosts */}
        <MetricCard title="Total Hosts" value={formatNumber(data.usersByRole?.hosts)} icon={Users} color="rose" subtitle="Approved host accounts" />
      </div>

      <div className="charts-grid">
        <ChartCard title="User Registration Timeline">
          <Line data={registrationTrendData} options={chartOptions} />
        </ChartCard>
        <ChartCard title="Role Distribution">
          <Doughnut data={roleData} options={doughnutOptions} />
        </ChartCard>
        <ChartCard title="Activity Heatmap (Day × Hour)">
          <Bar data={activityData} options={chartOptions} />
        </ChartCard>
      </div>

      {/* Backend: usersByRole */}
      {data.usersByRole && (
        <ChartCard title="User Segmentation by Role">
          <div className="performance-stats">
            <div className="stat-item"><span className="stat-label">Total Users:</span><span className="stat-value">{formatNumber(data.usersByRole.totalUsers)}</span></div>
            <div className="stat-item"><span className="stat-label">Regular Users:</span><span className="stat-value">{formatNumber(data.usersByRole.regularUsers)}</span></div>
            <div className="stat-item"><span className="stat-label">Hosts:</span><span className="stat-value">{formatNumber(data.usersByRole.hosts)}</span></div>
            <div className="stat-item"><span className="stat-label">Retention Rate:</span><span className="stat-value">{formatPercentage(data.userRetentionRate)}</span></div>
          </div>
        </ChartCard>
      )}

      {/* Backend: topActiveUsers */}
      {data.topActiveUsers && data.topActiveUsers.length > 0 && (
        <ChartCard title="Top Active Users">
          <DataTable columns={topUsersColumns} data={data.topActiveUsers} />
        </ChartCard>
      )}
    </div>
  );
};
export default UserAnalyticsSection;
