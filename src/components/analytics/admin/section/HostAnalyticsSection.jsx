import { useState, useEffect } from "react";
import { Building2, Zap, DollarSign, Star, CheckCircle, Clock } from "lucide-react";
import "../../../../services/charRegistration.js";
import { getAdminHostAnalytics, formatNumber, formatCurrency, formatPercentage } from "../../../../services/adminAnalyticsService";
import MetricCard from "../components/MetricCard";
import ChartCard from "../components/ChartCard";
import DataTable from "../components/DataTable";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { Line, Bar, Doughnut } from "react-chartjs-2";

const HostAnalyticsSection = ({ startDate, endDate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchHostAnalytics(); }, [startDate, endDate]);

  const fetchHostAnalytics = async () => {
    try {
      setLoading(true); setError(null);
      const response = await getAdminHostAnalytics(startDate, endDate);
      setData(response);
    } catch (err) {
      setError("Failed to load host analytics. Please try again.");
    } finally { setLoading(false); }
  };

  if (loading) return <LoadingSpinner message="Loading host analytics..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchHostAnalytics} />;
  if (!data) return null;

  // Backend: hostApprovalTimeline[].date, .approved, .rejected, .pending
  const approvalTimelineData = {
    labels: data.hostApprovalTimeline?.map((p) => p.date) || [],
    datasets: [
      { label: "Approved", data: data.hostApprovalTimeline?.map((p) => p.approved) || [],
        borderColor: "rgb(16,185,129)", backgroundColor: "rgba(16,185,129,0.1)", fill: true, tension: 0.4 },
      { label: "Pending", data: data.hostApprovalTimeline?.map((p) => p.pending) || [],
        borderColor: "rgb(245,158,11)", backgroundColor: "rgba(245,158,11,0.1)", fill: true, tension: 0.4 },
    ],
  };

  // Host status doughnut — Backend: totalHosts, activeHosts, pendingApprovals
  const hostStatusData = {
    labels: ["Active Hosts", "Pending Approval", "Inactive"],
    datasets: [{ data: [
        data.activeHosts || 0,
        data.pendingApprovals || 0,
        Math.max(0, (data.totalHosts || 0) - (data.activeHosts || 0) - (data.pendingApprovals || 0)),
      ],
      backgroundColor: ["rgba(16,185,129,0.8)", "rgba(245,158,11,0.8)", "rgba(107,114,128,0.8)"],
    }],
  };

  // Backend: topPerformingHostsByRevenue[].hostId, .name, .email, .totalRevenue, .bookingCount, .averageRating, .chargerCount, .joinedDate
  const topHostColumns = [
    { key: "name", label: "Host Name" },
    { key: "email", label: "Email" },
    { key: "chargerCount", label: "Chargers", render: (v) => formatNumber(v) },
    { key: "bookingCount", label: "Bookings", render: (v) => formatNumber(v) },
    { key: "totalRevenue", label: "Revenue", render: (v) => formatCurrency(v) },
    { key: "averageRating", label: "Rating", render: (v) => <span className="rating-badge">⭐ {v?.toFixed(2) || "N/A"}</span> },
    { key: "joinedDate", label: "Joined", render: (v) => v ? new Date(v).toLocaleDateString() : "N/A" },
  ];

  // Bar chart for top revenue hosts
  const revenueByHostData = {
    labels: data.topPerformingHostsByRevenue?.slice(0, 10).map((h) => h.name) || [],
    datasets: [{ label: "Revenue (NPR)", data: data.topPerformingHostsByRevenue?.slice(0, 10).map((h) => Number(h.totalRevenue) || 0) || [],
      backgroundColor: ["rgba(59,130,246,0.8)","rgba(16,185,129,0.8)","rgba(245,158,11,0.8)","rgba(239,68,68,0.8)",
        "rgba(139,92,246,0.8)","rgba(236,72,153,0.8)","rgba(20,184,166,0.8)","rgba(251,146,60,0.8)",
        "rgba(132,204,22,0.8)","rgba(168,85,247,0.8)"],
    }],
  };

  const chartOptions = { responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } };
  const multiLineOptions = { responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: true, position: "top" } }, scales: { y: { beginAtZero: true } } };
  const doughnutOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } };

  return (
    <div className="host-analytics-section">
      <div className="metrics-grid">
        {/* Backend: totalHosts */}
        <MetricCard title="Total Hosts" value={formatNumber(data.totalHosts)} icon={Building2} color="blue" subtitle="Approved hosts" />
        {/* Backend: activeHosts */}
        <MetricCard title="Active Hosts" value={formatNumber(data.activeHosts)} icon={CheckCircle} color="green" subtitle="Hosts with chargers" />
        {/* Backend: pendingApprovals */}
        <MetricCard title="Pending Approvals" value={formatNumber(data.pendingApprovals)} icon={Clock} color="yellow" subtitle="Awaiting approval" />
        {/* Backend: avgChargersPerHost */}
        <MetricCard title="Avg Chargers / Host" value={(data.avgChargersPerHost || 0).toFixed(2)} icon={Zap} color="purple" subtitle="Per host metric" />
        {/* Backend: totalHostRevenue */}
        <MetricCard title="Total Host Revenue" value={formatCurrency(data.totalHostRevenue)} icon={DollarSign} color="emerald" subtitle="All-time earnings" />
        {/* Backend: avgHostRating */}
        <MetricCard title="Avg Host Rating" value={(data.avgHostRating || 0).toFixed(2)} icon={Star} color="amber" subtitle="Platform average" />
      </div>

      <div className="charts-grid">
        <ChartCard title="Host Approval Timeline">
          <Line data={approvalTimelineData} options={multiLineOptions} />
        </ChartCard>
        <ChartCard title="Host Status Distribution">
          <Doughnut data={hostStatusData} options={doughnutOptions} />
        </ChartCard>
        <ChartCard title="Top 10 Hosts by Revenue">
          <Bar data={revenueByHostData} options={chartOptions} />
        </ChartCard>
      </div>

      {/* Host Management Metrics */}
      <ChartCard title="Host Management Metrics">
        <div className="performance-stats">
          <div className="stat-item"><span className="stat-label">Pending to Approved Ratio:</span><span className="stat-value">{(data.pendingToApprovedRatio || 0).toFixed(2)}</span></div>
          <div className="stat-item"><span className="stat-label">Avg Approval Time (days):</span><span className="stat-value">{(data.averageApprovalTimeDays || 0).toFixed(1)}</span></div>
          <div className="stat-item"><span className="stat-label">Host Churn Rate:</span><span className="stat-value">{formatPercentage(data.hostChurnRate)}</span></div>
          <div className="stat-item"><span className="stat-label">Total Approved Hosts:</span><span className="stat-value">{formatNumber(data.totalApprovedHosts)}</span></div>
        </div>
      </ChartCard>

      {/* Backend: topPerformingHostsByRevenue */}
      {data.topPerformingHostsByRevenue?.length > 0 && (
        <ChartCard title="Top Performing Hosts by Revenue">
          <DataTable columns={topHostColumns} data={data.topPerformingHostsByRevenue} />
        </ChartCard>
      )}

      {/* Backend: topRatedHosts */}
      {data.topRatedHosts?.length > 0 && (
        <ChartCard title="Top Rated Hosts">
          <DataTable columns={topHostColumns} data={data.topRatedHosts} />
        </ChartCard>
      )}

      {/* Backend: hostsWithMostBookings */}
      {data.hostsWithMostBookings?.length > 0 && (
        <ChartCard title="Hosts with Most Bookings">
          <DataTable columns={topHostColumns} data={data.hostsWithMostBookings} />
        </ChartCard>
      )}
    </div>
  );
};
export default HostAnalyticsSection;
