import React, { useState } from 'react';
import { FiMessageCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { chatService } from '../services/chatService';
import '../css/chatButton.css';

/**
 * Enhanced ChatButton Component
 * 
 * Features:
 * - Creates or gets existing conversation
 * - Supports different conversation types (USER_HOST, USER_ADMIN, etc.)
 * - Can include charger context
 * - Navigates to chat dashboard with conversation pre-selected
 * 
 * Usage Examples:
 * 
 * 1. User chatting with Host:
 * <ChatButton 
 *   userId={hostId} 
 *   userName="John Doe" 
 *   userType="host"
 *   chargerId={123}
 * />
 * 
 * 2. User chatting with Admin:
 * <ChatButton 
 *   userId={adminId} 
 *   userName="Support Team" 
 *   userType="admin"
 * />
 * 
 * 3. Admin chatting with User:
 * <ChatButton 
 *   userId={userId} 
 *   userName="Jane Smith" 
 *   userType="user"
 * />
 */
const ChatButton = ({ 
  userId, 
  userName, 
  userType = 'user', 
  chargerId = null,
  size = 'medium', 
  variant = 'primary',
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const currentUserRole = localStorage.getItem('role');

  const handleChatClick = async () => {
    if (!userId) {
      setError('User information not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare conversation initiation request
      const request = {
        otherUserId: userId
      };

      // Add charger context if provided (for USER_HOST conversations)
      if (chargerId) {
        request.chargerId = chargerId;
      }

      console.log('🔄 Initiating conversation:', request);

      // Initiate or get conversation
      const conversation = await chatService.initiateConversation(request);
      
      console.log('✅ Conversation created/retrieved:', conversation);

      // Navigate to chat dashboard with conversation pre-selected
      navigate('/dashboard/messages', {
        state: { 
          selectedConversationId: conversation.conversationId,
          otherUser: {
            userId: userId,
            firstName: userName.split(' ')[0] || userName,
            lastName: userName.split(' ')[1] || ''
          }
        }
      });
    } catch (err) {
      console.error('❌ Failed to create conversation:', err);
      setError('Failed to start chat. Please try again.');
      
      // Auto-clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Determine button text based on user type
  const getButtonText = () => {
    if (loading) return 'Connecting...';
    
    switch (userType.toLowerCase()) {
      case 'host':
        return 'Chat with Host';
      case 'admin':
        return 'Contact Support';
      case 'user':
        return currentUserRole === 'ADMIN' ? `Chat with ${userName}` : 'Send Message';
      default:
        return 'Start Chat';
    }
  };

  // Button classes based on props
  const buttonClasses = [
    'chat-button',
    `chat-button-${size}`,
    `chat-button-${variant}`,
    loading && 'chat-button-loading',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="chat-button-container">
      <button
        className={buttonClasses}
        onClick={handleChatClick}
        disabled={loading}
        title={getButtonText()}
      >
        <FiMessageCircle className="chat-button-icon" />
        <span>{getButtonText()}</span>
      </button>
      
      {error && (
        <div className="chat-button-error">
          {error}
        </div>
      )}
    </div>
  );
};

export default ChatButton;