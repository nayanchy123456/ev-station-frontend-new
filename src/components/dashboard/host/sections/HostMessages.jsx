import React from 'react';
import ChatDashboard from '../../../ChatDashboard.jsx';

/**
 * HostMessages - Chat Component for Host Dashboard
 * 
 * This component allows hosts to chat with:
 * - Users (guests) who have booked their chargers
 * - Admins for support
 * 
 * Features:
 * ✅ Real-time messaging with guests
 * ✅ Support chat with admins
 * ✅ Unread message notifications
 * ✅ Conversation filtering (Guests / Support)
 * ✅ Charger-specific conversations
 * 
 * Usage:
 * Import this component in your Host Dashboard routing/sections
 */
const HostMessages = () => {
  return (
    <div className="host-messages-section">
      <ChatDashboard />
    </div>
  );
};

export default HostMessages;