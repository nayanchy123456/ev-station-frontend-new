import React from 'react';
import ChatDashboard from '../../../ChatDashboard.jsx';

/**
 * AdminMessages - Chat Component for Admin Dashboard
 * 
 * This component allows admins to:
 * - Chat with any user or host in the system
 * - Search for users/hosts to initiate conversations
 * - Provide support to users and hosts
 * - View all support conversations
 * 
 * Features:
 * ✅ Search and initiate chat with any user
 * ✅ Real-time messaging
 * ✅ Unread message notifications
 * ✅ Conversation filtering (Users / Hosts)
 * ✅ Support ticket management
 * 
 * Usage:
 * Import this component in your Admin Dashboard routing/sections
 */
const AdminMessages = () => {
  return (
    <div className="admin-messages-section">
      <ChatDashboard />
    </div>
  );
};

export default AdminMessages;