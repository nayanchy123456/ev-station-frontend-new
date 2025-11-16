import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

// User Sections
import UserProfile from "./user/sections/UserProfile";
import UserPayments from "./user/sections/UserPayments";
import UserSupport from "./user/sections/UserSupport";
import ChargerList from "./user/sections/ChargerList";

// Host Sections
import HostChargers from "./host/sections/HostChargers";
import AddCharger from "./host/sections/AddCharger";
import EditCharger from "./host/sections/EditCharger";
import HostBookings from "./host/sections/HostBookings";

// Admin Sections
import UsersManagement from "./admin/sections/UsersManagement";
import HostsManagement from "./admin/sections/HostsManagement";
import AllChargers from "./admin/sections/AllChargers";
import AdminReports from "./admin/sections/AdminReports";

import "../../css/dashboardLayout.css";

const DashboardLayout = ({ role }) => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchFilters, setSearchFilters] = useState({});
  const [selectedChargerId, setSelectedChargerId] = useState(null);

  const location = useLocation();

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleSearch = (filters) => setSearchFilters(filters);

  const renderSection = () => {
    if (role === "USER") {
      switch (activeSection) {
        case "dashboard":
        case "profile":
          return <UserProfile />;
        case "payments":
          return <UserPayments />;
        case "support":
          return <UserSupport />;
        case "chargers":
          return <ChargerList filters={searchFilters} />;
        default:
          return <UserProfile />;
      }
    }

    if (role === "HOST") {
      switch (activeSection) {
        case "dashboard":
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

    if (role === "ADMIN") {
      switch (activeSection) {
        case "dashboard":
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
        default:
          return <UsersManagement />;
      }
    }
  };

  // ✅ Show nested routes (EditCharger, ChargerDetail) when URL contains them
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
        />

        <div className="dashboard-content">
          {isNestedRoute ? <Outlet /> : renderSection()}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
