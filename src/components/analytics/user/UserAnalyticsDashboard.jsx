import { useState, useEffect } from "react";
import { Activity, DollarSign, Zap, BookOpen, Star, Calendar } from "lucide-react";
import UserSpendingAnalytics from "./UserSpendingAnalytics";
import UserChargingBehavior from "./UserChargingBehavior";
import UserBookingAnalytics from "./UserBookingAnalytics";
import UserRatingAnalytics from "./UserRatingAnalytics";
import "../../../css/adminAnalytics/adminAnalyticsDashboard.css";
import "../../../css/analytics.css";

// ── Overview tab ──────────────────────────────────────────────────────────────
import { getUserOverview, formatCurrency, formatNumber } from "../../../services/analyticsService";
import MetricCard from "../admin/components/MetricCard";
import ChartCard from "../admin/components/ChartCard";
import LoadingSpinner from "../admin/components/LoadingSpinner";
import ErrorMessage from "../admin/components/ErrorMessage";

const fmtHours = (h) => h != null ? `${parseFloat(h).toFixed(2)} hrs` : "0 hrs";
const fmtKwh  = (k) => k != null ? `${parseFloat(k).toFixed(2)} kWh` : "0 kWh";

const OverviewTab = ({ period }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { loadData(); }, [period]);

  const loadData = async () => {
    try {
      setLoading(true); setError(null);
      setData(await getUserOverview(period));
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
          title="Total Bookings" value={formatNumber(data.totalBookings)}
          icon={BookOpen} color="blue" subtitle="Charging sessions"
        />
        <MetricCard
          title="Total Spending" value={formatCurrency(data.totalSpent)}
          icon={DollarSign} color="green" subtitle="Amount paid"
        />
        <MetricCard
          title="Energy Consumed" value={fmtKwh(data.totalEnergyConsumed)}
          icon={Zap} color="purple" subtitle="Total charged"
        />
        <MetricCard
          title="Avg Session Duration" value={fmtHours(data.averageSessionDuration)}
          icon={Activity} color="orange" subtitle="Per charging session"
        />
        <MetricCard
          title="Completed Bookings" value={formatNumber(data.completedBookings)}
          icon={Activity} color="teal" subtitle="Successfully finished"
        />
        <MetricCard
          title="Avg Per Session" value={formatCurrency(data.averageSpendingPerSession)}
          icon={DollarSign} color="yellow" subtitle="Average cost per session"
        />
        {data.favoriteCharger && (
          <MetricCard
            title="Favourite Charger" value={data.favoriteCharger.chargerName}
            icon={Zap} color="purple" subtitle={`${data.favoriteCharger.visits} visits`}
          />
        )}
      </div>

      {(data.spendingComparison || data.bookingsComparison) && (
        <ChartCard title="Period Comparison">
          <div className="performance-stats">
            {data.spendingComparison && (
              <div className="stat-item">
                <span className="stat-label">Spending Change</span>
                <span className={`stat-value ${data.spendingComparison.changePercentage >= 0 ? "positive" : "negative"}`}>
                  {data.spendingComparison.changePercentage >= 0 ? "+" : ""}{data.spendingComparison.changePercentage?.toFixed(1)}%
                </span>
              </div>
            )}
            {data.bookingsComparison && (
              <div className="stat-item">
                <span className="stat-label">Bookings Change</span>
                <span className={`stat-value ${data.bookingsComparison.changePercentage >= 0 ? "positive" : "negative"}`}>
                  {data.bookingsComparison.changePercentage >= 0 ? "+" : ""}{data.bookingsComparison.changePercentage?.toFixed(1)}%
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
  { id: "overview",  label: "Overview",         icon: Activity   },
  { id: "spending",  label: "Spending",          icon: DollarSign },
  { id: "charging",  label: "Charging Behavior", icon: Zap        },
  { id: "bookings",  label: "Bookings",          icon: BookOpen   },
  { id: "ratings",   label: "Ratings",           icon: Star       },
];

const UserAnalyticsDashboard = ({ externalTab }) => {
  const [activeTab, setActiveTab] = useState(externalTab || "overview");
  const [period, setPeriod] = useState("LAST_30_DAYS");

  useEffect(() => {
    if (externalTab) setActiveTab(externalTab);
  }, [externalTab]);

  const renderSection = () => {
    switch (activeTab) {
      case "overview": return <OverviewTab period={period} />;
      case "spending": return <UserSpendingAnalytics />;
      case "charging": return <UserChargingBehavior />;
      case "bookings": return <UserBookingAnalytics />;
      case "ratings":  return <UserRatingAnalytics />;
      default:         return <OverviewTab period={period} />;
    }
  };

  return (
    <div className="admin-analytics-dashboard">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-content">
          <h1 className="analytics-title">My Analytics Dashboard</h1>
          <p className="analytics-subtitle">
            Track your charging sessions, spending, and history
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

export default UserAnalyticsDashboard;