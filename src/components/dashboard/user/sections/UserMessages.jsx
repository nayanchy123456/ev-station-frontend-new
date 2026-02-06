import React from 'react';
import ChatDashboard from '../../../ChatDashboard.jsx';

/**
 * UserMessages - Chat Component for User Dashboard
 * 
 * This component allows users to chat with:
 * - Hosts of chargers they have booked or want to book
 * - Admins for support
 * 
 * Features:
 * ✅ Real-time messaging with hosts
 * ✅ Support chat with admins
 * ✅ Unread message notifications
 * ✅ Conversation filtering (Hosts / Support)
 * ✅ Auto-initiate chat from ChargerDetail
 * 
 * @param {Object} chatInitData - Optional data to auto-initiate chat
 * @param {number} chatInitData.hostId - Host user ID
 * @param {string} chatInitData.hostEmail - Host email
 * @param {number} chatInitData.chargerId - Charger ID
 * @param {string} chatInitData.chargerName - Charger name
 */
const UserMessages = ({ chatInitData }) => {
  return (
    <div className="user-messages-section">
      <ChatDashboard chatInitData={chatInitData} />
    </div>
  );
};

export default UserMessages;