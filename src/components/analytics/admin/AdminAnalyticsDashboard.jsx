import { useState, useEffect } from "react";
import {
  Users,
  Building2,
  Zap,
  BookOpen,
  TrendingUp,
  Star,
  Activity,
  Clock,
} from "lucide-react";
import DateRangePicker from "./components/DateRangePicker";

// ✅ FIX: Folder is named "section" (singular), not "sections"
import OverviewSection from "./section/OverviewSection";
import UserAnalyticsSection from "./section/UserAnalyticsSection";
import HostAnalyticsSection from "./section/HostAnalyticsSection";
import ChargerAnalyticsSection from "./section/ChargerAnalyticsSection";
import BookingAnalyticsSection from "./section/BookingAnalyticsSection";
import RevenueAnalyticsSection from "./section/RevenueAnalyticsSection";
import RatingAnalyticsSection from "./section/RatingAnalyticsSection";
import PlatformPerformanceSection from "./section/PlatformPerformanceSection";
import TimeAnalyticsSection from "./section/TimeAnalyticsSection";

import { getDateRangePresets } from "../../../services/adminAnalyticsService";
import "../../../css/adminAnalytics/adminAnalyticsDashboard.css";

/**
 * AdminAnalyticsDashboard
 *
 * Can be used in two modes:
 *  1. Standalone (sidebar "Dashboard") — shows its own tab navigation
 *  2. Section-driven (sidebar analytics sub-menu) — pass `externalTab` to jump
 *     directly to a specific section without re-rendering the whole dashboard.
 */
const AdminAnalyticsDashboard = ({ externalTab }) => {
  const [activeTab, setActiveTab] = useState(externalTab || "overview");
  const [dateRange, setDateRange] = useState(() => {
    const presets = getDateRangePresets();
    return presets.LAST_30_DAYS;
  });

  // Sync when parent drives the active tab via prop
  useEffect(() => {
    if (externalTab) {
      setActiveTab(externalTab);
    }
  }, [externalTab]);

  const tabs = [
    { id: "overview",  label: "Overview",       icon: Activity  },
    { id: "users",     label: "Users",           icon: Users     },
    { id: "hosts",     label: "Hosts",           icon: Building2 },
    { id: "chargers",  label: "Chargers",        icon: Zap       },
    { id: "bookings",  label: "Bookings",        icon: BookOpen  },
    { id: "revenue",   label: "Revenue",         icon: TrendingUp},
    { id: "ratings",   label: "Ratings",         icon: Star      },
    { id: "platform",  label: "Platform",        icon: Activity  },
    { id: "time",      label: "Time Analytics",  icon: Clock     },
  ];

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
  };

  const sectionProps = {
    startDate: dateRange.startDate,
    endDate:   dateRange.endDate,
  };

  const renderActiveSection = () => {
    switch (activeTab) {
      case "overview":  return <OverviewSection           {...sectionProps} />;
      case "users":     return <UserAnalyticsSection      {...sectionProps} />;
      case "hosts":     return <HostAnalyticsSection      {...sectionProps} />;
      case "chargers":  return <ChargerAnalyticsSection   {...sectionProps} />;
      case "bookings":  return <BookingAnalyticsSection   {...sectionProps} />;
      case "revenue":   return <RevenueAnalyticsSection   {...sectionProps} />;
      case "ratings":   return <RatingAnalyticsSection    {...sectionProps} />;
      case "platform":  return <PlatformPerformanceSection {...sectionProps} />;
      case "time":      return <TimeAnalyticsSection      {...sectionProps} />;
      default:          return <OverviewSection           {...sectionProps} />;
    }
  };

  return (
    <div className="admin-analytics-dashboard">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-content">
          <h1 className="analytics-title">Admin Analytics Dashboard</h1>
          <p className="analytics-subtitle">
            Comprehensive platform insights and performance metrics
          </p>
        </div>
        <DateRangePicker
          dateRange={dateRange}
          onChange={handleDateRangeChange}
        />
      </div>

      {/* Tab Navigation */}
      <div className="analytics-tabs">
        {tabs.map((tab) => {
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
      <div className="analytics-content">{renderActiveSection()}</div>
    </div>
  );
};

export default AdminAnalyticsDashboard;