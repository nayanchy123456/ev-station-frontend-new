import React, { useState, useEffect } from "react";
import { FaBars, FaBell, FaSearch } from "react-icons/fa";
import { FiMessageSquare } from "react-icons/fi"; // ⭐ NEW - Message icon
import notificationService from "../../services/notificationService";
import chatService from "../../services/chatService"; // ⭐ NEW - Chat service
import "../../css/navbar.css";
import NotificationDropdown from "./NotificationDropdown";

const Navbar = ({ toggleSidebar, sidebarCollapsed, onSearch, setActiveSection }) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0); // ⭐ NEW - Chat unread count

  const user = JSON.parse(localStorage.getItem("user")) || { 
    firstName: "John", 
    lastName: "Doe", 
    role: "USER" 
  };

  // Fetch unread notification count on mount and periodically
  useEffect(() => {
    fetchUnreadCount();
    fetchUnreadChatCount(); // ⭐ NEW - Fetch chat unread count
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchUnreadChatCount(); // ⭐ NEW - Poll chat unread count
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

  // ⭐ NEW - Fetch unread chat message count
  const fetchUnreadChatCount = async () => {
    try {
      const count = await chatService.getUnreadCount();
      setUnreadChatCount(count);
    } catch (error) {
      console.error("Failed to fetch unread chat count:", error);
      // Don't set count on error, keep previous value
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

  // ⭐ NEW - Handle message icon click
  const handleMessagesClick = () => {
    if (setActiveSection) {
      setActiveSection('messages');
    }
    // Reset unread count after a short delay (allows navigation to complete)
    setTimeout(() => {
      setUnreadChatCount(0);
    }, 500);
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
        {/* ⭐ NEW - Messages Button with Unread Count */}
        <button 
          className="notification-btn messages-btn"
          onClick={handleMessagesClick}
          title="Messages"
        >
          <FiMessageSquare />
          {unreadChatCount > 0 && (
            <span className="notification-badge messages-badge">
              {unreadChatCount > 99 ? '99+' : unreadChatCount}
            </span>
          )}
        </button>

        {/* Existing Notifications Button */}
        <button 
          className="notification-btn"
          onClick={toggleNotifications}
          title="Notifications"
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