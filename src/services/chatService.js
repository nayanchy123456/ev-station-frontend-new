import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Dedicated axios instance for chat, with the same auto-refresh-on-401
// behavior as api.js's shared instance — the raw `axios` import doesn't
// retry expired tokens, which is why unread-count calls were failing silently.
const chatApi = axios.create();

chatApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("🔄 [chatApi] Attempting token refresh...");
        const refreshRes = await axios.post(
          `${API_URL}/auth/refresh`,
          null,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );

        const newToken = refreshRes.data.token;
        if (newToken) {
          console.log("✅ [chatApi] Token refreshed");
          localStorage.setItem('token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return chatApi(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

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

  async initiateConversation(request) {
    try {
      const response = await chatApi.post(
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

  async getConversations(page = 0, size = 20) {
    try {
      const response = await chatApi.get(
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

  async getConversationsByType(type, page = 0, size = 20) {
    try {
      const response = await chatApi.get(
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

  async getConversation(conversationId) {
    try {
      const response = await chatApi.get(
        `${API_URL}/chat/conversations/${conversationId}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw this.handleError(error);
    }
  }

  async getOrCreateConversation(otherUserId) {
    try {
      const response = await chatApi.post(
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

  async archiveConversation(conversationId, archive = true) {
    try {
      await chatApi.put(
        `${API_URL}/chat/conversations/${conversationId}/archive`,
        { archive },
        { headers: this.getAuthHeaders() }
      );
    } catch (error) {
      console.error('Error archiving conversation:', error);
      throw this.handleError(error);
    }
  }

  async searchConversations(query, page = 0, size = 20) {
    try {
      const response = await chatApi.get(
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

  async sendMessage(receiverId, content, conversationId = null) {
    console.warn('⚠️ sendMessage REST endpoint is deprecated. Use WebSocket instead.');
    throw new Error('Please send messages via WebSocket. REST endpoint not available.');
  }

  async getMessages(conversationId, page = 0, size = 30) {
    try {
      const response = await chatApi.get(
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

  async markAsRead(conversationId) {
    try {
      await chatApi.put(
        `${API_URL}/chat/conversations/${conversationId}/read`,
        {},
        { headers: this.getAuthHeaders() }
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw this.handleError(error);
    }
  }

  async searchMessages(conversationId, query, page = 0, size = 20) {
    try {
      const response = await chatApi.get(
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

  async getAdminSupportConversations(page = 0, size = 20) {
    try {
      const response = await chatApi.get(
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

  async searchUsersForAdminChat(request) {
    try {
      const response = await chatApi.post(
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

  async adminInitiateChat(request) {
    try {
      const response = await chatApi.post(
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

  async getChargerHostId(chargerId) {
    try {
      const response = await chatApi.get(
        `${API_URL}/chat/charger/${chargerId}/host`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.hostId;
    } catch (error) {
      console.error('Error fetching charger host:', error);
      throw this.handleError(error);
    }
  }

  async getChargerConversations(chargerId, page = 0, size = 20) {
    try {
      const response = await chatApi.get(
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

  async getTotalUnreadCount() {
    try {
      const response = await chatApi.get(
        `${API_URL}/chat/unread/total`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching total unread count:', error);
      throw this.handleError(error);
    }
  }

  async getUnreadCount() {
    try {
      const data = await this.getTotalUnreadCount();
      return data.totalUnreadCount || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0; // Return 0 instead of throwing to prevent UI crashes
    }
  }

  async getUserPresence(userId) {
    try {
      const response = await chatApi.get(
        `${API_URL}/chat/presence/${userId}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching user presence:', error);
      throw this.handleError(error);
    }
  }

  async checkHealth() {
    try {
      const response = await chatApi.get(
        `${API_URL}/chat/health`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error checking chat health:', error);
      throw this.handleError(error);
    }
  }

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