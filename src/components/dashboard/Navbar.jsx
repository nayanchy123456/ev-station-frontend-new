import React, { useState } from "react";
import "../../css/navbar.css";
import { FaBars, FaBell, FaSearch } from "react-icons/fa";

const Navbar = ({ toggleSidebar, sidebarCollapsed, onSearch }) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const user = JSON.parse(localStorage.getItem("user")) || { 
    firstName: "John", 
    lastName: "Doe", 
    role: "USER" 
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
    // Trim whitespace and validate
    const trimmedQuery = searchQuery.trim();
    
    if (trimmedQuery && onSearch) {
      // Only search if there's actual content
      onSearch({ query: trimmedQuery });
    } else if (!trimmedQuery && onSearch) {
      // Optional: handle empty search (clear results, show all, etc.)
      onSearch({ query: "" });
    }
  };

  // Optional: Add click handler for search icon
  const handleSearchClick = () => {
    handleSearch();
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
            onClick={handleSearchClick} // Make icon clickable
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
        <button className="notification-btn">
          <FaBell />
          <span className="notification-badge">3</span>
        </button>
        
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