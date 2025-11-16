import React from "react";
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
  FaTimes
} from "react-icons/fa";

const Sidebar = ({ role, setActiveSection, activeSection, handleLogout, collapsed, toggleSidebar }) => {

  const userMenu = [
    { key: "dashboard", icon: <FaHome />, label: "Dashboard" },
    { key: "profile", icon: <FaUser />, label: "Profile" },
    { key: "chargers", icon: <FaChargingStation />, label: "Find Chargers" },
    { key: "payments", icon: <FaMoneyBillAlt />, label: "Payments" },
    { key: "support", icon: <FaLifeRing />, label: "Support" },
    { key: "settings", icon: <FaCog />, label: "Settings" }
  ];

  const hostMenu = [
    { key: "dashboard", icon: <FaHome />, label: "Dashboard" },
    { key: "myChargers", icon: <FaChargingStation />, label: "My Chargers" },
    { key: "addCharger", icon: <FaPlus />, label: "Add Charger" },
    { key: "bookings", icon: <FaClipboardList />, label: "Bookings" },
    { key: "payments", icon: <FaMoneyBillAlt />, label: "Payments" },
    { key: "support", icon: <FaLifeRing />, label: "Support" },
    { key: "settings", icon: <FaCog />, label: "Settings" }
  ];

  const adminMenu = [
    { key: "dashboard", icon: <FaHome />, label: "Dashboard" },
    { key: "users", icon: <FaUsers />, label: "Users Management" },
    { key: "hosts", icon: <FaUsers />, label: "Hosts Management" },
    { key: "chargers", icon: <FaChargingStation />, label: "All Chargers" },
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
          <li 
            key={item.key} 
            className={activeSection === item.key ? "active" : ""}
            onClick={() => setActiveSection(item.key)}
            data-tooltip={item.label}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {item.icon}
            <span className="text">{item.label}</span>
          </li>
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