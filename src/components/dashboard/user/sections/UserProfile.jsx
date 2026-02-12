import React, { useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaEdit,
  FaIdCard,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaCheckCircle,
} from "react-icons/fa";
import "../../../../css/userProfile.css";

const UserProfile = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [isEditing, setIsEditing] = useState(false);

  // Format date nicely
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get user initials for avatar
  const getInitials = () => {
    const first = user?.firstName?.charAt(0) || "";
    const last = user?.lastName?.charAt(0) || "";
    return (first + last).toUpperCase();
  };

  // Get role badge color
  const getRoleBadge = (role) => {
    switch (role) {
      case "USER":
        return "badge-user";
      case "HOST":
        return "badge-host";
      case "ADMIN":
        return "badge-admin";
      default:
        return "badge-user";
    }
  };

  return (
    <div className="user-profile-container">
      {/* Header Section */}
      <div className="profile-header">
        <div className="profile-header-content">
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-subtitle">
            Manage your personal information and account settings
          </p>
        </div>
        <button
          className="edit-profile-btn"
          onClick={() => setIsEditing(!isEditing)}
        >
          <FaEdit />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Profile Card */}
      <div className="profile-main-card">
        {/* Avatar Section */}
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              <span className="avatar-initials">{getInitials()}</span>
            </div>
            <div className="avatar-badge">
              <FaCheckCircle />
            </div>
          </div>
          <div className="profile-name-section">
            <h2 className="profile-name">
              {user?.firstName} {user?.lastName}
            </h2>
            <span className={`role-badge ${getRoleBadge(user?.role)}`}>
              <FaShieldAlt />
              {user?.role?.toLowerCase()}
            </span>
          </div>
        </div>

        {/* Information Grid */}
        <div className="profile-info-grid">
          {/* Personal Information Card */}
          <div className="info-card">
            <div className="info-card-header">
              <FaUser className="card-icon" />
              <h3>Personal Information</h3>
            </div>
            <div className="info-items">
              <div className="info-item">
                <div className="info-label">
                  <FaIdCard className="item-icon" />
                  <span>User ID</span>
                </div>
                <div className="info-value">{user?.id || "N/A"}</div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <FaUser className="item-icon" />
                  <span>First Name</span>
                </div>
                <div className="info-value">{user?.firstName || "N/A"}</div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <FaUser className="item-icon" />
                  <span>Last Name</span>
                </div>
                <div className="info-value">{user?.lastName || "N/A"}</div>
              </div>
            </div>
          </div>

          {/* Contact Information Card */}
          <div className="info-card">
            <div className="info-card-header">
              <FaEnvelope className="card-icon" />
              <h3>Contact Information</h3>
            </div>
            <div className="info-items">
              <div className="info-item">
                <div className="info-label">
                  <FaEnvelope className="item-icon" />
                  <span>Email Address</span>
                </div>
                <div className="info-value email-value">
                  {user?.email || "N/A"}
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <FaPhone className="item-icon" />
                  <span>Phone Number</span>
                </div>
                <div className="info-value">{user?.phone || "N/A"}</div>
              </div>
              {user?.address && (
                <div className="info-item">
                  <div className="info-label">
                    <FaMapMarkerAlt className="item-icon" />
                    <span>Address</span>
                  </div>
                  <div className="info-value">{user.address}</div>
                </div>
              )}
            </div>
          </div>

          {/* Account Details Card */}
          <div className="info-card">
            <div className="info-card-header">
              <FaShieldAlt className="card-icon" />
              <h3>Account Details</h3>
            </div>
            <div className="info-items">
              <div className="info-item">
                <div className="info-label">
                  <FaShieldAlt className="item-icon" />
                  <span>Account Type</span>
                </div>
                <div className="info-value">
                  <span className={`status-badge ${getRoleBadge(user?.role)}`}>
                    {user?.role || "N/A"}
                  </span>
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <FaCalendarAlt className="item-icon" />
                  <span>Member Since</span>
                </div>
                <div className="info-value">
                  {formatDate(user?.createdAt)}
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <FaCheckCircle className="item-icon" />
                  <span>Account Status</span>
                </div>
                <div className="info-value">
                  <span className="status-badge active">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;