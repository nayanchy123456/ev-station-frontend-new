import React, { useState, useEffect } from "react";
import "../../css/sidebar.css";
import {
  FaUser,
  FaMoneyBillAlt,
  FaLifeRing,
  FaSignOutAlt,
  FaChargingStation,
  FaPlus,
  FaClipboardList,
  FaUsers,
  FaChartBar,
  FaHome,
  FaCog,
  FaBars,
  FaTimes,
  FaCalendarCheck,
  FaChevronDown,
  FaChevronRight,
  FaStar,
  FaDollarSign,
  FaBolt,
  FaCalendar,
  FaUserFriends,
  FaBuilding,
  FaClock,
  FaTachometerAlt,
} from "react-icons/fa";
import { FiMessageSquare, FiActivity, FiTrendingUp } from "react-icons/fi";
import { MdOutlineBarChart } from "react-icons/md";

const Sidebar = ({
  role,
  setActiveSection,
  activeSection,
  handleLogout,
  collapsed,
  toggleSidebar,
}) => {
  const [analyticsExpanded, setAnalyticsExpanded] = useState(false);

  // Auto-expand analytics if on analytics page
  useEffect(() => {
    if (activeSection.startsWith("analytics-")) {
      setAnalyticsExpanded(true);
    }
  }, [activeSection]);

  // ── Submenus ──────────────────────────────────────────────────────────────

  const userAnalyticsSubmenu = [
    { key: "analytics-overview", icon: <FaChartBar />, label: "Overview" },
    { key: "analytics-spending", icon: <FaDollarSign />, label: "Spending" },
    { key: "analytics-charging", icon: <FaBolt />, label: "Charging Behavior" },
    { key: "analytics-bookings", icon: <FaCalendar />, label: "Bookings" },
    { key: "analytics-ratings", icon: <FaStar />, label: "Ratings" },
  ];

  const hostAnalyticsSubmenu = [
    { key: "analytics-overview", icon: <FaChartBar />, label: "Overview" },
    { key: "analytics-revenue", icon: <FaDollarSign />, label: "Revenue" },
    {
      key: "analytics-chargers",
      icon: <FaChargingStation />,
      label: "Chargers",
    },
    { key: "analytics-bookings", icon: <FaCalendar />, label: "Bookings" },
    { key: "analytics-users", icon: <FaUserFriends />, label: "Users" },
  ];

  /**
   * Admin analytics sub-menu mirrors the 9 tabs inside AdminAnalyticsDashboard.
   * Each key starts with "analytics-" so the parent stays highlighted.
   */
  const adminAnalyticsSubmenu = [
    { key: "analytics-overview", icon: <FiActivity />, label: "Overview" },
    { key: "analytics-users", icon: <FaUsers />, label: "Users" },
    { key: "analytics-hosts", icon: <FaBuilding />, label: "Hosts" },
    {
      key: "analytics-chargers",
      icon: <FaChargingStation />,
      label: "Chargers",
    },
    { key: "analytics-bookings", icon: <FaCalendar />, label: "Bookings" },
    { key: "analytics-revenue", icon: <FiTrendingUp />, label: "Revenue" },
    { key: "analytics-ratings", icon: <FaStar />, label: "Ratings" },
    {
      key: "analytics-platform",
      icon: <MdOutlineBarChart />,
      label: "Platform",
    },
    { key: "analytics-time", icon: <FaClock />, label: "Time Analytics" },
  ];

  // ── Menus ─────────────────────────────────────────────────────────────────

  const userMenu = [
    { key: "dashboard", icon: <FaHome />, label: "Dashboard" },
    { key: "profile", icon: <FaUser />, label: "Profile" },
    {
      key: "chargers",
      icon: <FaChargingStation />,
      label: "Find Chargers",
    },
    { key: "bookings", icon: <FaCalendarCheck />, label: "My Bookings" },
    { key: "messages", icon: <FiMessageSquare />, label: "Messages" },
    {
      key: "analytics",
      icon: <FaChartBar />,
      label: "Analytics",
      hasSubmenu: true,
      submenu: userAnalyticsSubmenu,
    },
    { key: "settings", icon: <FaCog />, label: "Settings" },
  ];

  const hostMenu = [
    { key: "dashboard", icon: <FaHome />, label: "Dashboard" },
    {
      key: "myChargers",
      icon: <FaChargingStation />,
      label: "My Chargers",
    },
    { key: "addCharger", icon: <FaPlus />, label: "Add Charger" },
    { key: "bookings", icon: <FaClipboardList />, label: "Bookings" },
    { key: "messages", icon: <FiMessageSquare />, label: "Messages" },
    {
      key: "analytics",
      icon: <FaChartBar />,
      label: "Analytics",
      hasSubmenu: true,
      submenu: hostAnalyticsSubmenu,
    },
    { key: "settings", icon: <FaCog />, label: "Settings" },
  ];

  const adminMenu = [
    { key: "dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
    { key: "hosts", icon: <FaBuilding />, label: "Hosts Management" },
    { key: "messages", icon: <FiMessageSquare />, label: "Messages" },
    {
      key: "analytics",
      icon: <FaChartBar />,
      label: "Analytics",
      hasSubmenu: true,
      submenu: adminAnalyticsSubmenu,
    },
    { key: "settings", icon: <FaCog />, label: "Settings" },
  ];

  // ── Helpers ───────────────────────────────────────────────────────────────

  const getMenu = () => {
    switch (role) {
      case "USER":
        return userMenu;
      case "HOST":
        return hostMenu;
      case "ADMIN":
        return adminMenu;
      default:
        return userMenu;
    }
  };

  const getRoleDisplay = () => {
    switch (role) {
      case "USER":
        return "User";
      case "HOST":
        return "Host";
      case "ADMIN":
        return "Admin";
      default:
        return "User";
    }
  };

  const isAnalyticsActive = () => activeSection.startsWith("analytics-");

  const handleMenuClick = (item) => {
    if (item.hasSubmenu) {
      const newState = !analyticsExpanded;
      setAnalyticsExpanded(newState);
      if (newState && !activeSection.startsWith("analytics-")) {
        setActiveSection("analytics-overview");
      }
    } else {
      setActiveSection(item.key);
      setAnalyticsExpanded(false);
    }
  };

  const menu = getMenu();

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Header */}
      <div className="sidebar-header">
        <h2 className="dashboard-title">
          {collapsed ? "EV" : `${getRoleDisplay()} Dashboard`}
        </h2>
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          {collapsed ? <FaBars /> : <FaTimes />}
        </button>
      </div>

      {/* Role Badge */}
      {!collapsed && (
        <div className="sidebar-role-badge">{getRoleDisplay()}</div>
      )}

      {/* Main Menu */}
      <ul className="sidebar-menu">
        {menu.map((item, index) => (
          <React.Fragment key={item.key}>
            <li
              className={`${
                activeSection === item.key ||
                (item.hasSubmenu && isAnalyticsActive())
                  ? "active"
                  : ""
              } ${item.hasSubmenu ? "has-submenu" : ""}`}
              onClick={() => handleMenuClick(item)}
              data-tooltip={item.label}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {item.icon}
              <span className="text">{item.label}</span>
              {item.hasSubmenu && !collapsed && (
                <span className="submenu-arrow">
                  {analyticsExpanded ? <FaChevronDown /> : <FaChevronRight />}
                </span>
              )}
            </li>

            {/* Submenu */}
            {item.hasSubmenu && (
              <ul
                className={`sidebar-submenu ${
                  analyticsExpanded && !collapsed ? "show" : ""
                }`}
              >
                {item.submenu.map((subItem, subIndex) => (
                  <li
                    key={subItem.key}
                    className={activeSection === subItem.key ? "active" : ""}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSection(subItem.key);
                    }}
                    style={{
                      animationDelay: `${(index + subIndex + 1) * 0.05}s`,
                    }}
                  >
                    {subItem.icon}
                    <span className="text">{subItem.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </React.Fragment>
        ))}

        {/* Logout */}
        <li
          onClick={handleLogout}
          data-tooltip="Logout"
          className="logout-item"
        >
          <FaSignOutAlt />
          <span className="text">Logout</span>
        </li>
      </ul>

      {/* Footer */}
      {!collapsed && (
        <div className="sidebar-footer">
          <div className="footer-item">
            <span className="text">v1.0.0</span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;