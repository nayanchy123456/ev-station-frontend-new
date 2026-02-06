import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

/**
 * WebSocket Service for Real-Time Chat
 * 
 * Features:
 * - Automatic reconnection with exponential backoff
 * - JWT authentication
 * - Subscription management
 * - Message queue during disconnection
 * - Heartbeat monitoring
 * 
 * Usage:
 * ```js
 * const token = localStorage.getItem('token');
 * websocketService.connect(token, 
 *   () => console.log('Connected'),
 *   (err) => console.error('Error:', err)
 * );
 * 
 * websocketService.subscribe('/user/queue/messages', (message) => {
 *   console.log('New message:', message);
 * });
 * 
 * websocketService.sendMessage('/app/chat.sendMessage', {
 *   receiverId: 123,
 *   content: 'Hello!'
 * });
 * ```
 */
class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.messageQueue = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.token = null;
    this.onConnectCallback = null;
    this.onErrorCallback = null;
  }

  /**
   * Connect to WebSocket Server
   * @param {string} token - JWT authentication token
   * @param {function} onConnect - Callback when connected
   * @param {function} onError - Callback on error
   */
  connect(token, onConnect, onError) {
    if (this.connected) {
      console.log('✅ Already connected to WebSocket');
      if (onConnect) onConnect();
      return;
    }

    this.token = token;
    this.onConnectCallback = onConnect;
    this.onErrorCallback = onError;

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';
    
    console.log('🔌 Connecting to WebSocket:', wsUrl);

    this.client = new Client({
      // Use SockJS for better compatibility and fallback support
      webSocketFactory: () => new SockJS(wsUrl),
      
      // Authentication header with JWT token
      connectHeaders: {
        'Authorization': `Bearer ${token}`
      },
      
      // Debug logging (disable in production)
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.log('🔍 STOMP:', str);
        }
      },
      
      // Heartbeat configuration (ping/pong)
      // Values in milliseconds: 0 means disabled
      heartbeatIncoming: 25000,  // Expect heartbeat from server every 25s
      heartbeatOutgoing: 25000,  // Send heartbeat to server every 25s
      
      // Reconnection configuration
      reconnectDelay: 5000,  // Wait 5s before reconnecting
      
      // Connection successful
      onConnect: (frame) => {
        console.log('✅ WebSocket Connected:', frame);
        this.connected = true;
        this.reconnectAttempts = 0;
        
        // Process queued messages
        this.processMessageQueue();
        
        if (this.onConnectCallback) {
          this.onConnectCallback(frame);
        }
      },
      
      // STOMP-level error
      onStompError: (frame) => {
        console.error('❌ STOMP Error:', frame.headers['message']);
        console.error('Error details:', frame.body);
        this.connected = false;
        
        if (this.onErrorCallback) {
          this.onErrorCallback(new Error(frame.headers['message'] || 'STOMP error'));
        }
      },
      
      // WebSocket-level error
      onWebSocketError: (event) => {
        console.error('❌ WebSocket Error:', event);
        this.connected = false;
        
        if (this.onErrorCallback) {
          this.onErrorCallback(event);
        }
      },
      
      // Disconnected
      onDisconnect: () => {
        console.warn('🔌 WebSocket Disconnected');
        this.connected = false;
        
        // Attempt to reconnect
        this.attemptReconnect();
      },
      
      // WebSocket closed
      onWebSocketClose: (event) => {
        console.log('🔒 WebSocket Closed:', event.code, event.reason);
        this.connected = false;
      }
    });

    // Activate the connection
    try {
      this.client.activate();
    } catch (error) {
      console.error('❌ Failed to activate WebSocket:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback(error);
      }
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  attemptReconnect() {
    if (!this.token) {
      console.error('❌ Cannot reconnect: No token available');
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached. Please refresh the page.');
      if (this.onErrorCallback) {
        this.onErrorCallback(new Error('Max reconnection attempts reached'));
      }
      return;
    }

    this.reconnectAttempts++;
    
    // Exponential backoff: 3s, 6s, 12s, 24s, 48s
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Reconnecting in ${delay / 1000}s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      console.log('🔄 Attempting to reconnect...');
      this.connect(this.token, this.onConnectCallback, this.onErrorCallback);
    }, delay);
  }

  /**
   * Subscribe to a destination
   * @param {string} destination - STOMP destination (e.g., "/topic/messages/123")
   * @param {function} callback - Message handler callback
   * @returns {string|null} Subscription ID
   */
  subscribe(destination, callback) {
    if (!this.connected || !this.client) {
      console.warn('⚠️ Cannot subscribe: Not connected. Queuing subscription...');
      
      // Queue the subscription to be processed after connection
      this.messageQueue.push({
        type: 'subscribe',
        destination,
        callback
      });
      
      return null;
    }

    console.log('📡 Subscribing to:', destination);

    try {
      const subscription = this.client.subscribe(destination, (message) => {
        try {
          const body = JSON.parse(message.body);
          console.log('📨 Received message:', { destination, body });
          callback(body);
        } catch (error) {
          console.error('❌ Error parsing message:', error);
          console.error('Raw message:', message.body);
        }
      });

      const subId = subscription.id;
      this.subscriptions.set(subId, { destination, subscription });
      
      console.log('✅ Subscribed to:', destination, 'ID:', subId);
      
      return subId;
    } catch (error) {
      console.error('❌ Error subscribing:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from a destination
   * @param {string} subId - Subscription ID
   */
  unsubscribe(subId) {
    if (!subId) return;

    const sub = this.subscriptions.get(subId);
    if (sub) {
      console.log('📡 Unsubscribing from:', sub.destination);
      
      try {
        sub.subscription.unsubscribe();
        this.subscriptions.delete(subId);
        console.log('✅ Unsubscribed successfully');
      } catch (error) {
        console.error('❌ Error unsubscribing:', error);
      }
    } else {
      console.warn('⚠️ Subscription not found:', subId);
    }
  }

  /**
   * Send message to destination
   * @param {string} destination - STOMP destination (e.g., "/app/chat.sendMessage")
   * @param {object} payload - Message payload
   * @returns {boolean} Success status
   */
  sendMessage(destination, payload) {
    if (!this.connected || !this.client) {
      console.warn('⚠️ Cannot send: Not connected. Queuing message...');
      
      // Queue the message to be sent after reconnection
      this.messageQueue.push({
        type: 'send',
        destination,
        payload
      });
      
      return false;
    }

    console.log('📤 Sending message to:', destination, payload);

    try {
      this.client.publish({
        destination: destination,
        body: JSON.stringify(payload)
      });
      
      console.log('✅ Message sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      // Queue for retry
      this.messageQueue.push({
        type: 'send',
        destination,
        payload
      });
      
      return false;
    }
  }

  /**
   * Process queued messages after reconnection
   */
  processMessageQueue() {
    if (this.messageQueue.length === 0) return;

    console.log(`📦 Processing ${this.messageQueue.length} queued operations...`);

    const queue = [...this.messageQueue];
    this.messageQueue = [];

    queue.forEach(operation => {
      if (operation.type === 'send') {
        this.sendMessage(operation.destination, operation.payload);
      } else if (operation.type === 'subscribe') {
        this.subscribe(operation.destination, operation.callback);
      }
    });

    console.log('✅ Message queue processed');
  }

  /**
   * Send typing indicator
   * @param {number} conversationId - Conversation ID
   */
  sendTyping(conversationId) {
    this.sendMessage('/app/chat.typing', conversationId);
  }

  /**
   * Send stop typing indicator
   * @param {number} conversationId - Conversation ID
   */
  sendStopTyping(conversationId) {
    this.sendMessage('/app/chat.stopTyping', conversationId);
  }

  /**
   * Mark message as read
   * @param {number} messageId - Message ID
   */
  markAsRead(messageId) {
    this.sendMessage('/app/chat.markAsRead', messageId);
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (!this.client) {
      console.log('⚠️ No client to disconnect');
      return;
    }

    console.log('🔌 Disconnecting from WebSocket...');
    
    try {
      // Unsubscribe from all subscriptions
      this.subscriptions.forEach((sub, subId) => {
        this.unsubscribe(subId);
      });
      
      // Deactivate the client
      this.client.deactivate();
      
      this.connected = false;
      this.client = null;
      this.token = null;
      
      console.log('✅ Disconnected successfully');
    } catch (error) {
      console.error('❌ Error during disconnection:', error);
    }
  }

  /**
   * Check if connected
   * @returns {boolean} Connection status
   */
  isConnected() {
    return this.connected && this.client && this.client.connected;
  }

  /**
   * Get connection state
   * @returns {string} Connection state
   */
  getConnectionState() {
    if (!this.client) return 'DISCONNECTED';
    return this.client.state || 'UNKNOWN';
  }

  /**
   * Force reconnect (useful for testing)
   */
  forceReconnect() {
    console.log('🔄 Forcing reconnect...');
    this.disconnect();
    
    if (this.token) {
      setTimeout(() => {
        this.connect(this.token, this.onConnectCallback, this.onErrorCallback);
      }, 1000);
    } else {
      console.error('❌ Cannot reconnect: No token available');
    }
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export default websocketService;