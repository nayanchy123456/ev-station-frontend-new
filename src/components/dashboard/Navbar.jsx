import React, { useState, useEffect } from "react";
import { FaBars, FaBell, FaSearch } from "react-icons/fa";
import notificationService from "../../services/notificationService";
import "../../css/navbar.css";
import NotificationDropdown from "./NotificationDropDown";

const Navbar = ({ toggleSidebar, sidebarCollapsed, onSearch }) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const user = JSON.parse(localStorage.getItem("user")) || { 
    firstName: "John", 
    lastName: "Doe", 
    role: "USER" 
  };

  // Fetch unread notification count on mount and periodically
  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return "U";
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSearch = () => {
    const trimmedQuery = searchQuery.trim();
    
    if (trimmedQuery && onSearch) {
      onSearch({ query: trimmedQuery });
    } else if (!trimmedQuery && onSearch) {
      onSearch({ query: "" });
    }
  };

  const handleSearchClick = () => {
    handleSearch();
  };

  const toggleNotifications = () => {
    setShowNotifications(prev => !prev);
  };

  const handleCloseNotifications = () => {
    setShowNotifications(false);
    // Refresh unread count when closing
    fetchUnreadCount();
  };

  return (
    <div className={`navbar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="navbar-left">
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <span className="navbar-title">
          <span className="title-icon">⚡</span>
          Community EV Station
        </span>
      </div>

      <div className="navbar-center">
        <div className={`search-container ${searchFocused ? 'focused' : ''}`}>
          <FaSearch 
            className="search-icon" 
            onClick={handleSearchClick}
            style={{ cursor: 'pointer' }}
          />
          <input 
            type="text" 
            placeholder="Search chargers, location..." 
            className="search-input"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
      </div>

      <div className="navbar-right">
        <button 
          className="notification-btn"
          onClick={toggleNotifications}
        >
          <FaBell />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>
        
        <NotificationDropdown
          isOpen={showNotifications}
          onClose={handleCloseNotifications}
        />
        
        <div className="navbar-user">
          <div className="user-info">
            <span className="user-name">{user?.firstName} {user?.lastName}</span>
            <span className="user-role">{user?.role?.toLowerCase()}</span>
          </div>
          <div className="user-avatar">
            {getInitials()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;