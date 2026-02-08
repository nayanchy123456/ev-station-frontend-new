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
  FaUserFriends
} from "react-icons/fa";
import { FiMessageSquare } from "react-icons/fi";

const Sidebar = ({ role, setActiveSection, activeSection, handleLogout, collapsed, toggleSidebar }) => {
  const [analyticsExpanded, setAnalyticsExpanded] = useState(false);

  // Auto-expand analytics if on analytics page
  useEffect(() => {
    if (activeSection.startsWith('analytics-')) {
      setAnalyticsExpanded(true);
    }
  }, [activeSection]);

  // Debug: Log when analytics expanded state changes
  useEffect(() => {
    console.log('📊 Analytics Expanded:', analyticsExpanded);
  }, [analyticsExpanded]);

  // User Analytics Submenu
  const userAnalyticsSubmenu = [
    { key: "analytics-overview", icon: <FaChartBar />, label: "Overview" },
    { key: "analytics-spending", icon: <FaDollarSign />, label: "Spending" },
    { key: "analytics-charging", icon: <FaBolt />, label: "Charging Behavior" },
    { key: "analytics-bookings", icon: <FaCalendar />, label: "Bookings" },
    { key: "analytics-ratings", icon: <FaStar />, label: "Ratings" }
  ];

  // Host Analytics Submenu
  const hostAnalyticsSubmenu = [
    { key: "analytics-overview", icon: <FaChartBar />, label: "Overview" },
    { key: "analytics-revenue", icon: <FaDollarSign />, label: "Revenue" },
    { key: "analytics-chargers", icon: <FaChargingStation />, label: "Chargers" },
    { key: "analytics-bookings", icon: <FaCalendar />, label: "Bookings" },
    { key: "analytics-users", icon: <FaUserFriends />, label: "Users" }
  ];

  // User Menu with Analytics
  const userMenu = [
    { key: "dashboard", icon: <FaHome />, label: "Dashboard" },
    { key: "profile", icon: <FaUser />, label: "Profile" },
    { key: "chargers", icon: <FaChargingStation />, label: "Find Chargers" },
    { key: "bookings", icon: <FaCalendarCheck />, label: "My Bookings" },
    { key: "messages", icon: <FiMessageSquare />, label: "Messages" },
    { 
      key: "analytics", 
      icon: <FaChartBar />, 
      label: "Analytics",
      hasSubmenu: true,
      submenu: userAnalyticsSubmenu
    },
    { key: "payments", icon: <FaMoneyBillAlt />, label: "Payments" },
    { key: "support", icon: <FaLifeRing />, label: "Support" },
    { key: "settings", icon: <FaCog />, label: "Settings" }
  ];

  // Host Menu with Analytics
  const hostMenu = [
    { key: "dashboard", icon: <FaHome />, label: "Dashboard" },
    { key: "myChargers", icon: <FaChargingStation />, label: "My Chargers" },
    { key: "addCharger", icon: <FaPlus />, label: "Add Charger" },
    { key: "bookings", icon: <FaClipboardList />, label: "Bookings" },
    { key: "messages", icon: <FiMessageSquare />, label: "Messages" },
    { 
      key: "analytics", 
      icon: <FaChartBar />, 
      label: "Analytics",
      hasSubmenu: true,
      submenu: hostAnalyticsSubmenu
    },
    { key: "payments", icon: <FaMoneyBillAlt />, label: "Payments" },
    { key: "support", icon: <FaLifeRing />, label: "Support" },
    { key: "settings", icon: <FaCog />, label: "Settings" }
  ];

  // Admin Menu (no analytics submenu for admin)
  const adminMenu = [
    { key: "dashboard", icon: <FaHome />, label: "Dashboard" },
    { key: "users", icon: <FaUsers />, label: "Users Management" },
    { key: "hosts", icon: <FaUsers />, label: "Hosts Management" },
    { key: "chargers", icon: <FaChargingStation />, label: "All Chargers" },
    { key: "messages", icon: <FiMessageSquare />, label: "Messages" },
    { key: "reports", icon: <FaChartBar />, label: "Reports" },
    { key: "support", icon: <FaLifeRing />, label: "Support" },
    { key: "settings", icon: <FaCog />, label: "Settings" }
  ];

  const getMenu = () => {
    switch(role) {
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

  const menu = getMenu();

  const getRoleDisplay = () => {
    switch(role) {
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

  const handleMenuClick = (item) => {
    console.log('🖱️ Menu clicked:', item.label, 'Has submenu:', item.hasSubmenu);
    
    if (item.hasSubmenu) {
      const newState = !analyticsExpanded;
      console.log('🔄 Toggling analytics submenu to:', newState);
      setAnalyticsExpanded(newState);
      
      // Set default analytics overview when opening analytics for the first time
      if (newState && !activeSection.startsWith('analytics-')) {
        setActiveSection('analytics-overview');
      }
    } else {
      console.log('➡️ Setting active section to:', item.key);
      setActiveSection(item.key);
      // Close analytics dropdown when clicking other menu items
      setAnalyticsExpanded(false);
    }
  };

  const isAnalyticsActive = () => {
    return activeSection.startsWith('analytics-');
  };

  // Debug: Log current state
  useEffect(() => {
    console.log('🎯 Current active section:', activeSection);
    console.log('📱 Sidebar collapsed:', collapsed);
    console.log('👤 Role:', role);
  }, [activeSection, collapsed, role]);

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Sidebar Header with Toggle */}
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
        <div className="sidebar-role-badge">
          {getRoleDisplay()}
        </div>
      )}

      {/* Main Menu */}
      <ul className="sidebar-menu">
        {menu.map((item, index) => (
          <React.Fragment key={item.key}>
            <li 
              className={`${activeSection === item.key || (item.hasSubmenu && isAnalyticsActive()) ? "active" : ""} ${item.hasSubmenu ? "has-submenu" : ""}`}
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

            {/* Submenu for Analytics - FIXED: Always render but control visibility with CSS */}
            {item.hasSubmenu && (
              <ul className={`sidebar-submenu ${analyticsExpanded && !collapsed ? 'show' : ''}`}>
                {item.submenu.map((subItem, subIndex) => (
                  <li
                    key={subItem.key}
                    className={activeSection === subItem.key ? "active" : ""}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('📌 Submenu item clicked:', subItem.label);
                      setActiveSection(subItem.key);
                    }}
                    style={{ animationDelay: `${(index + subIndex + 1) * 0.05}s` }}
                  >
                    {subItem.icon}
                    <span className="text">{subItem.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </React.Fragment>
        ))}

        {/* Logout Button */}
        <li 
          onClick={handleLogout}
          data-tooltip="Logout"
          className="logout-item"
        >
          <FaSignOutAlt />
          <span className="text">Logout</span>
        </li>
      </ul>

      {/* Sidebar Footer */}
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