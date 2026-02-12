import { useState, useEffect } from "react";
import { Activity, DollarSign, Zap, BookOpen, Users, Calendar } from "lucide-react";
import HostRevenueAnalytics from "./HostRevenueAnalytics";
import HostChargerAnalytics from "./HostChargerAnalytics";
import HostBookingAnalytics from "./HostBookingAnalytics";
import HostUserAnalytics from "./HostUserAnalytics";
import "../../../css/adminAnalytics/adminAnalyticsDashboard.css";
import "../../../css/host-analytics.css";

// ── Overview tab: a summary pulled from HostAnalyticsDashboard's original content ──
import {
  getHostOverview,
  formatCurrency,
  formatNumber,
  getTrendInfo,
} from "../../../services/analyticsService";
import MetricCard from "../admin/components/MetricCard";
import ChartCard from "../admin/components/ChartCard";
import LoadingSpinner from "../admin/components/LoadingSpinner";
import ErrorMessage from "../admin/components/ErrorMessage";

const OverviewTab = ({ period }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { loadData(); }, [period]);

  const loadData = async () => {
    try {
      setLoading(true); setError(null);
      setData(await getHostOverview(period));
    } catch {
      setError("Failed to load overview analytics.");
    } finally { setLoading(false); }
  };

  if (loading) return <LoadingSpinner />;
  if (error)   return <ErrorMessage message={error} onRetry={loadData} />;
  if (!data)   return null;

  return (
    <div className="overview-section">
      <div className="metrics-grid">
        <MetricCard
          title="Total Revenue" value={formatCurrency(data.totalRevenue)}
          icon={DollarSign} color="green"
          subtitle={data.revenueComparison ? getTrendInfo(data.revenueComparison).text + " vs last period" : "All earned revenue"}
        />
        <MetricCard
          title="Active Users" value={formatNumber(data.activeUsers)}
          icon={Users} color="blue" subtitle="Unique customers"
        />
        <MetricCard
          title="Total Chargers" value={formatNumber(data.totalChargers)}
          icon={Zap} color="purple" subtitle="Active stations"
        />
        <MetricCard
          title="Total Bookings" value={formatNumber(data.totalBookings)}
          icon={BookOpen} color="yellow"
          subtitle={data.bookingsComparison ? getTrendInfo(data.bookingsComparison).text + " vs last period" : "All bookings"}
        />
        <MetricCard
          title="Completed Bookings" value={formatNumber(data.completedBookings)}
          icon={Activity} color="teal" subtitle="Successfully finished"
        />
        <MetricCard
          title="Completion Rate"
          value={data.completionRate != null ? `${data.completionRate.toFixed(1)}%` : "0%"}
          icon={Calendar} color="orange"
          subtitle={`${formatNumber(data.completedBookings)} of ${formatNumber(data.totalBookings)}`}
        />
        {data.averageRating != null && (
          <MetricCard
            title="Average Rating" value={`${data.averageRating.toFixed(1)} ★`}
            icon={Activity} color="yellow" subtitle="Customer satisfaction"
          />
        )}
      </div>

      {(data.revenueComparison || data.bookingsComparison || data.activeUsersComparison) && (
        <ChartCard title="Period Comparison">
          <div className="performance-stats">
            {data.revenueComparison && (
              <div className="stat-item">
                <span className="stat-label">Revenue Change</span>
                <span className={`stat-value ${data.revenueComparison.isIncrease ? "positive" : "negative"}`}>
                  {data.revenueComparison.isIncrease ? "+" : ""}{data.revenueComparison.changePercentage?.toFixed(1)}%
                </span>
              </div>
            )}
            {data.bookingsComparison && (
              <div className="stat-item">
                <span className="stat-label">Bookings Change</span>
                <span className={`stat-value ${data.bookingsComparison.isIncrease ? "positive" : "negative"}`}>
                  {data.bookingsComparison.isIncrease ? "+" : ""}{data.bookingsComparison.changePercentage?.toFixed(1)}%
                </span>
              </div>
            )}
            {data.activeUsersComparison && (
              <div className="stat-item">
                <span className="stat-label">Active Users Change</span>
                <span className={`stat-value ${data.activeUsersComparison.isIncrease ? "positive" : "negative"}`}>
                  {data.activeUsersComparison.isIncrease ? "+" : ""}{data.activeUsersComparison.changePercentage?.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </ChartCard>
      )}
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const PERIODS = {
  LAST_7_DAYS:  "Last 7 Days",
  LAST_30_DAYS: "Last 30 Days",
  ALL_TIME:     "All Time",
};

const TABS = [
  { id: "overview", label: "Overview", icon: Activity   },
  { id: "revenue",  label: "Revenue",  icon: DollarSign },
  { id: "chargers", label: "Chargers", icon: Zap        },
  { id: "bookings", label: "Bookings", icon: BookOpen   },
  { id: "users",    label: "Users",    icon: Users      },
];

const HostAnalyticsDashboard = ({ externalTab }) => {
  const [activeTab, setActiveTab] = useState(externalTab || "overview");
  const [period, setPeriod] = useState("LAST_30_DAYS");

  useEffect(() => {
    if (externalTab) setActiveTab(externalTab);
  }, [externalTab]);

  const renderSection = () => {
    switch (activeTab) {
      case "overview": return <OverviewTab period={period} />;
      case "revenue":  return <HostRevenueAnalytics />;
      case "chargers": return <HostChargerAnalytics />;
      case "bookings": return <HostBookingAnalytics />;
      case "users":    return <HostUserAnalytics />;
      default:         return <OverviewTab period={period} />;
    }
  };

  return (
    <div className="admin-analytics-dashboard">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-content">
          <h1 className="analytics-title">Host Analytics Dashboard</h1>
          <p className="analytics-subtitle">
            Track your charging station performance and revenue
          </p>
        </div>

        {/* Period selector — only shown on Overview tab */}
        {activeTab === "overview" && (
          <div style={{
            display: "flex", alignItems: "center", gap: "0.25rem",
            background: "var(--bg-card)", border: "1px solid var(--border-light)",
            borderRadius: "10px", padding: "0.4rem", backdropFilter: "blur(20px)",
          }}>
            <Calendar size={16} style={{ color: "var(--text-secondary)", marginRight: "0.25rem" }} />
            {Object.entries(PERIODS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                style={{
                  padding: "0.5rem 1rem", borderRadius: "8px", border: "none",
                  cursor: "pointer", fontSize: "0.875rem", fontWeight: 500,
                  transition: "all 0.2s ease",
                  background: period === key
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "transparent",
                  color: period === key ? "#fff" : "var(--text-secondary)",
                  boxShadow: period === key ? "0 0 15px rgba(102,126,234,0.4)" : "none",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="analytics-tabs">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="tab-icon" size={18} />
              <span className="tab-label">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="analytics-content">
        {renderSection()}
      </div>
    </div>
  );
};

export default HostAnalyticsDashboard;