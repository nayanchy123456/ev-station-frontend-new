import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Enhanced Chat Service with Admin Support
 * 
 * Features:
 * ✅ User-Host-Admin conversations
 * ✅ Admin user search and chat initiation
 * ✅ Conversation filtering by type
 * ✅ Send messages via REST and WebSocket
 * ✅ Get conversations with pagination
 * ✅ Get conversation messages
 * ✅ Mark messages as read
 * ✅ Get unread counts
 * ✅ User presence tracking
 */
class ChatService {
  /**
   * Get auth headers with JWT token
   */
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // ==================== CONVERSATION MANAGEMENT ====================

  /**
   * Initiate or get conversation with context
   * 
   * @param {Object} request - Conversation initiate request
   * @returns {Promise<Object>} Conversation data
   */
  async initiateConversation(request) {
    try {
      const response = await axios.post(
        `${API_URL}/chat/conversations/initiate`,
        request,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error initiating conversation:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get all conversations for current user
   * 
   * @param {number} page - Page number (0-indexed)
   * @param {number} size - Number of conversations per page
   * @returns {Promise<Object>} Paginated conversations
   */
  async getConversations(page = 0, size = 20) {
    try {
      const response = await axios.get(
        `${API_URL}/chat/conversations`,
        {
          params: { page, size },
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get conversations by type
   * 
   * @param {string} type - Conversation type (USER_HOST, USER_ADMIN, HOST_ADMIN, ADMIN_SUPPORT)
   * @param {number} page - Page number
   * @param {number} size - Page size
   * @returns {Promise<Object>} Filtered conversations
   */
  async getConversationsByType(type, page = 0, size = 20) {
    try {
      const response = await axios.get(
        `${API_URL}/chat/conversations/type/${type}`,
        {
          params: { page, size },
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations by type:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get specific conversation by ID
   * 
   * @param {number} conversationId - Conversation ID
   * @returns {Promise<Object>} Conversation data
   */
  async getConversation(conversationId) {
    try {
      const response = await axios.get(
        `${API_URL}/chat/conversations/${conversationId}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get or create a conversation with a specific user
   * 
   * @param {number} otherUserId - ID of the other user
   * @returns {Promise<Object>} Conversation data
   */
  async getOrCreateConversation(otherUserId) {
    try {
      const response = await axios.post(
        `${API_URL}/chat/conversations/initiate`,
        { otherUserId },
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting/creating conversation:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Archive/unarchive conversation
   * 
   * @param {number} conversationId - Conversation ID
   * @param {boolean} archive - True to archive, false to unarchive
   * @returns {Promise<void>}
   */
  async archiveConversation(conversationId, archive = true) {
    try {
      await axios.put(
        `${API_URL}/chat/conversations/${conversationId}/archive`,
        { archive },
        { headers: this.getAuthHeaders() }
      );
    } catch (error) {
      console.error('Error archiving conversation:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Search conversations
   * 
   * @param {string} query - Search query
   * @param {number} page - Page number
   * @param {number} size - Page size
   * @returns {Promise<Object>} Search results
   */
  async searchConversations(query, page = 0, size = 20) {
    try {
      const response = await axios.get(
        `${API_URL}/chat/conversations/search`,
        {
          params: { q: query, page, size },
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error searching conversations:', error);
      throw this.handleError(error);
    }
  }

  // ==================== MESSAGE MANAGEMENT ====================

  /**
   * Send a message (REST fallback) - DEPRECATED
   * Note: The backend doesn't have POST /api/chat/send endpoint
   * Messages should be sent via WebSocket only
   * 
   * @param {number} receiverId - ID of the message recipient
   * @param {string} content - Message content
   * @param {number} conversationId - Optional conversation ID
   * @returns {Promise<Object>} Sent message data
   */
  async sendMessage(receiverId, content, conversationId = null) {
    console.warn('⚠️ sendMessage REST endpoint is deprecated. Use WebSocket instead.');
    throw new Error('Please send messages via WebSocket. REST endpoint not available.');
  }

  /**
   * Get messages for a specific conversation
   * 
   * @param {number} conversationId - Conversation ID
   * @param {number} page - Page number (0-indexed)
   * @param {number} size - Number of messages per page
   * @returns {Promise<Object>} Paginated messages
   */
  async getMessages(conversationId, page = 0, size = 30) {
    try {
      const response = await axios.get(
        `${API_URL}/chat/conversations/${conversationId}/messages`,
        {
          params: { page, size },
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Mark all messages in a conversation as read
   * 
   * @param {number} conversationId - Conversation ID
   * @returns {Promise<void>}
   */
  async markAsRead(conversationId) {
    try {
      await axios.put(
        `${API_URL}/chat/conversations/${conversationId}/read`,
        {},
        { headers: this.getAuthHeaders() }
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Search messages in a conversation
   * 
   * @param {number} conversationId - Conversation ID
   * @param {string} query - Search query
   * @param {number} page - Page number
   * @param {number} size - Page size
   * @returns {Promise<Object>} Search results
   */
  async searchMessages(conversationId, query, page = 0, size = 20) {
    try {
      const response = await axios.get(
        `${API_URL}/chat/conversations/${conversationId}/search`,
        {
          params: { q: query, page, size },
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error searching messages:', error);
      throw this.handleError(error);
    }
  }

  // ==================== ADMIN FUNCTIONS ====================

  /**
   * Get support conversations (Admin only)
   * 
   * @param {number} page - Page number
   * @param {number} size - Page size
   * @returns {Promise<Object>} Support conversations
   */
  async getAdminSupportConversations(page = 0, size = 20) {
    try {
      const response = await axios.get(
        `${API_URL}/chat/admin/support`,
        {
          params: { page, size },
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching support conversations:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Search users for admin chat (Admin only)
   * 
   * @param {Object} request - Search request with filters
   * @returns {Promise<Object>} Page of users
   */
  async searchUsersForAdminChat(request) {
    try {
      const response = await axios.post(
        `${API_URL}/chat/admin/search-users`,
        request,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error searching users for admin chat:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Admin initiate chat with user (Admin only)
   * 
   * @param {Object} request - Contains targetUserId and optional initialMessage
   * @returns {Promise<Object>} Created conversation
   */
  async adminInitiateChat(request) {
    try {
      const response = await axios.post(
        `${API_URL}/chat/admin/initiate`,
        request,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error admin initiating chat:', error);
      throw this.handleError(error);
    }
  }

  // ==================== CHARGER FUNCTIONS ====================

  /**
   * Get charger host ID
   * 
   * @param {number} chargerId - Charger ID
   * @returns {Promise<number>} Host user ID
   */
  async getChargerHostId(chargerId) {
    try {
      const response = await axios.get(
        `${API_URL}/chat/charger/${chargerId}/host`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.hostId;
    } catch (error) {
      console.error('Error fetching charger host:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get conversations about a specific charger
   * 
   * @param {number} chargerId - Charger ID
   * @param {number} page - Page number
   * @param {number} size - Page size
   * @returns {Promise<Object>} Charger conversations
   */
  async getChargerConversations(chargerId, page = 0, size = 20) {
    try {
      const response = await axios.get(
        `${API_URL}/chat/charger/${chargerId}/conversations`,
        {
          params: { page, size },
          headers: this.getAuthHeaders()
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching charger conversations:', error);
      throw this.handleError(error);
    }
  }

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Get total unread message count
   * 
   * @returns {Promise<Object>} Object with totalUnreadCount
   */
  async getTotalUnreadCount() {
    try {
      const response = await axios.get(
        `${API_URL}/chat/unread/total`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching total unread count:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get unread count (alias for getTotalUnreadCount for backward compatibility)
   * This is used by Navbar component
   * 
   * @returns {Promise<number>} Unread count
   */
  async getUnreadCount() {
    try {
      const data = await this.getTotalUnreadCount();
      return data.totalUnreadCount || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0; // Return 0 instead of throwing to prevent UI crashes
    }
  }

  /**
   * Get user presence status
   * 
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Presence data
   */
  async getUserPresence(userId) {
    try {
      const response = await axios.get(
        `${API_URL}/chat/presence/${userId}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching user presence:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Check chat service health
   * 
   * @returns {Promise<Object>} Health status
   */
  async checkHealth() {
    try {
      const response = await axios.get(
        `${API_URL}/chat/health`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error checking chat health:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors consistently
   * 
   * @param {Error} error - Axios error object
   * @returns {Error} Formatted error
   */
  handleError(error) {
    if (error.response) {
      const message = error.response.data?.message || error.response.data || 'An error occurred';
      return new Error(message);
    } else if (error.request) {
      return new Error('No response from server. Please check your connection.');
    } else {
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();
export default chatService;