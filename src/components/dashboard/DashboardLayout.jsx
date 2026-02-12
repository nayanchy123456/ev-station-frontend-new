import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

// User Sections
import UserProfile from "./user/sections/UserProfile";
import UserPayments from "./user/sections/UserPayments";
import UserSupport from "./user/sections/UserSupport";
import ChargerList from "./user/sections/ChargerList";
import MyBookings from "./user/sections/MyBookings";
import UserMessages from "./user/sections/UserMessages";

// User Analytics Components
import UserAnalyticsDashboard from "../analytics/user/UserAnalyticsDashboard";
import UserSpendingAnalytics from "../analytics/user/UserSpendingAnalytics";
import UserChargingBehavior from "../analytics/user/UserChargingBehavior";
import UserBookingAnalytics from "../analytics/user/UserBookingAnalytics";
import UserRatingAnalytics from "../analytics/user/UserRatingAnalytics";

// Host Sections
import HostChargers from "./host/sections/HostChargers";
import AddCharger from "./host/sections/AddCharger";
import EditCharger from "./host/sections/EditCharger";
import HostBookings from "./host/sections/HostBookings";
import HostMessages from "./host/sections/HostMessages";

// Host Analytics Components
import HostAnalyticsDashboard from "../analytics/host/HostAnalyticsDashboard";
import HostRevenueAnalytics from "../analytics/host/HostRevenueAnalytics";
import HostChargerAnalytics from "../analytics/host/HostChargerAnalytics";
import HostBookingAnalytics from "../analytics/host/HostBookingAnalytics";
import HostUserAnalytics from "../analytics/host/HostUserAnalytics";

// Admin Sections
import UsersManagement from "./admin/sections/UsersManagement";
import HostsManagement from "./admin/sections/HostsManagement";
import AllChargers from "./admin/sections/AllChargers";
import AdminReports from "./admin/sections/AdminReports";
import AdminMessages from "./admin/sections/AdminMessages";

// Admin Analytics — full dashboard (contains its own tab navigation)
import AdminAnalyticsDashboard from "../analytics/admin/AdminAnalyticsDashboard";

import "../../css/dashboardLayout.css";

/**
 * Maps sidebar analytics-* keys to AdminAnalyticsDashboard tab ids.
 * "analytics-overview" → "overview", "analytics-users" → "users", etc.
 */
const ANALYTICS_TAB_MAP = {
  "analytics-overview": "overview",
  "analytics-users": "users",
  "analytics-hosts": "hosts",
  "analytics-chargers": "chargers",
  "analytics-bookings": "bookings",
  "analytics-revenue": "revenue",
  "analytics-ratings": "ratings",
  "analytics-platform": "platform",
  "analytics-time": "time",
};

const DashboardLayout = ({ role }) => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchFilters, setSearchFilters] = useState({});
  const [selectedChargerId, setSelectedChargerId] = useState(null);
  const [chatInitData, setChatInitData] = useState(null);



  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  const handleSearch = (filters) => setSearchFilters(filters);

  // Navigate to chat/messages via router state
  useEffect(() => {
    if (
      location.state?.navigateTo === "chat" ||
      location.state?.navigateTo === "messages"
    ) {
      setChatInitData({
        hostId: location.state.hostId,
        hostEmail: location.state.hostEmail,
        chargerId: location.state.chargerId,
        chargerName: location.state.chargerName,
      });
      setActiveSection("messages");
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  // Listen for custom events dispatched by child components
  useEffect(() => {
    const handleSetActiveSection = (event) => {
      setActiveSection(event.detail);
    };
    window.addEventListener("setActiveSection", handleSetActiveSection);
    return () =>
      window.removeEventListener("setActiveSection", handleSetActiveSection);
  }, []);



  // ── Section renderer ─────────────────────────────────────────────────────
  const renderSection = () => {
    // ── USER ────────────────────────────────────────────────────────────────
    if (role === "USER") {
      switch (activeSection) {
        case "dashboard":
          return <UserAnalyticsDashboard />;
        case "profile":
          return <UserProfile />;
        case "payments":
          return <UserPayments />;
        case "support":
          return <UserSupport />;
        case "chargers":
          return <ChargerList filters={searchFilters} />;
        case "bookings":
          return <MyBookings setActiveSection={setActiveSection} />;
        case "messages":
          return <UserMessages chatInitData={chatInitData} />;
        case "analytics-overview":
          return <UserAnalyticsDashboard externalTab="overview" />;
        case "analytics-spending":
          return <UserAnalyticsDashboard externalTab="spending" />;
        case "analytics-charging":
          return <UserAnalyticsDashboard externalTab="charging" />;
        case "analytics-bookings":
          return <UserAnalyticsDashboard externalTab="bookings" />;
        case "analytics-ratings":
          return <UserAnalyticsDashboard externalTab="ratings" />;
        default:
          return <UserProfile />;
      }
    }

    // ── HOST ────────────────────────────────────────────────────────────────
    if (role === "HOST") {
      switch (activeSection) {
        case "dashboard":
          return <HostAnalyticsDashboard />;
        case "myChargers":
          return (
            <HostChargers
              filters={searchFilters}
              setActiveSection={setActiveSection}
              setSelectedChargerId={setSelectedChargerId}
            />
          );
        case "addCharger":
          return <AddCharger />;
        case "editCharger":
          return <EditCharger chargerId={selectedChargerId} />;
        case "bookings":
          return <HostBookings />;
        case "payments":
          return <UserPayments />;
        case "support":
          return <UserSupport />;
        case "messages":
          return <HostMessages chatInitData={chatInitData} />;
        case "analytics-overview":
          return <HostAnalyticsDashboard externalTab="overview" />;
        case "analytics-revenue":
          return <HostAnalyticsDashboard externalTab="revenue" />;
        case "analytics-chargers":
          return <HostAnalyticsDashboard externalTab="chargers" />;
        case "analytics-bookings":
          return <HostAnalyticsDashboard externalTab="bookings" />;
        case "analytics-users":
          return <HostAnalyticsDashboard externalTab="users" />;
        default:
          return (
            <HostChargers
              filters={searchFilters}
              setActiveSection={setActiveSection}
              setSelectedChargerId={setSelectedChargerId}
            />
          );
      }
    }

    // ── ADMIN ───────────────────────────────────────────────────────────────
    if (role === "ADMIN") {
      // All analytics-* sections render via AdminAnalyticsDashboard with an externalTab
      if (activeSection.startsWith("analytics-")) {
        const tab = ANALYTICS_TAB_MAP[activeSection] || "overview";
        return <AdminAnalyticsDashboard externalTab={tab} />;
      }

      switch (activeSection) {
        case "dashboard":
          // Dashboard shows the full analytics dashboard (its own tabs)
          return <AdminAnalyticsDashboard />;
        case "users":
          return <UsersManagement />;
        case "hosts":
          return <HostsManagement />;
        case "chargers":
          return <AllChargers filters={searchFilters} />;
        case "reports":
          return <AdminReports />;
        case "support":
          return <UserSupport />;
        case "messages":
          return <AdminMessages />;
        default:
          return <UsersManagement />;
      }
    }
  };

  const isNestedRoute =
    location.pathname.includes("edit-charger") ||
    location.pathname.includes("charger/");

  return (
    <div className="dashboard-container">
      <Sidebar
        role={role}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        collapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        handleLogout={handleLogout}
      />

      <div
        className={`dashboard-main ${
          sidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        <Navbar
          toggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
          onSearch={handleSearch}
          setActiveSection={setActiveSection}
        />

        <div className="dashboard-content">
          {isNestedRoute ? <Outlet /> : renderSection()}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;