import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FiSend, 
  FiSearch, 
  FiMessageSquare, 
  FiArrowLeft,
  FiMoreVertical,
  FiRefreshCw,
  FiAlertCircle,
  FiUsers,
  FiFilter,
  FiX,
  FiHelpCircle
} from 'react-icons/fi';
import { MdDone, MdDoneAll } from 'react-icons/md';
import { chatService } from '../services/chatService';
import { websocketService } from '../services/websocketService';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { useLocation } from 'react-router-dom';
import '../css/chatDashboard.css';

/**
 * Complete ChatDashboard Component
 * 
 * Features:
 * ✅ Real-time messaging via WebSocket
 * ✅ User-Host-Admin conversations
 * ✅ Admin can search and initiate chats
 * ✅ Support button for users/hosts to contact admins
 * ✅ Conversation filtering by type
 * ✅ Message history with pagination
 * ✅ Typing indicators
 * ✅ Read receipts
 * ✅ Online/offline presence
 * ✅ Mobile responsive
 */
const ChatDashboard = ({ chatInitData }) => {
  // ==================== STATE MANAGEMENT ====================
  
  // Get current user info with error handling
  const getUserId = () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('❌ No userId in localStorage');
      return null;
    }
    return parseInt(userId);
  };
  
  const getUserRole = () => {
    const role = localStorage.getItem('role');
    if (!role) {
      console.error('❌ No role in localStorage');
      return null;
    }
    return role;
  };
  
  const currentUserId = getUserId();
  const currentUserRole = getUserRole();
  const isAdmin = currentUserRole === 'ADMIN';
  const isHost = currentUserRole === 'HOST';
  const isUser = currentUserRole === 'USER';
  const location = useLocation();
  
  // Conversations & Messages
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [conversationFilter, setConversationFilter] = useState('ALL');
  
  // Admin-specific state
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  
  // Support (Admin) contact state
  const [showAdminList, setShowAdminList] = useState(false);
  const [availableAdmins, setAvailableAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showConversationList, setShowConversationList] = useState(true);
  const [error, setError] = useState(null);
  
  // WebSocket State
  const [wsConnected, setWsConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  const messageListRef = useRef(null);
  const conversationSubRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingIndicatorTimeoutRef = useRef(null);
  const userSearchTimeoutRef = useRef(null);
  const chatInitiatedRef = useRef(false);

  // ==================== LIFECYCLE & INITIALIZATION ====================

  useEffect(() => {
    console.log('🚀 ChatDashboard mounted - Role:', currentUserRole, 'User ID:', currentUserId);
    
    // Check if user is authenticated
    if (!currentUserId || !currentUserRole) {
      console.error('❌ User not authenticated. userId:', currentUserId, 'role:', currentUserRole);
      setError('Please log in to use chat');
      setLoading(false);
      return;
    }
    
    // Initialize
    initWebSocket();
    loadConversations();
    
    // Handle pre-selected conversation from navigation
    if (location.state?.selectedConversationId) {
      loadSpecificConversation(location.state.selectedConversationId);
    } else if (location.state?.otherUserId) {
      // Initiate conversation with specific user
      initiateConversationWithUser(location.state.otherUserId);
    }
    
    // Handle window resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      console.log('🔌 ChatDashboard unmounting');
      websocketService.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle conversation selection
  useEffect(() => {
    if (selectedConversation && wsConnected) {
      loadMessages();
      markAsRead();
      subscribeToConversation();
      
      if (isMobile) {
        setShowConversationList(false);
      }
    }
    
    return () => {
      if (conversationSubRef.current) {
        websocketService.unsubscribe(conversationSubRef.current);
        conversationSubRef.current = null;
      }
    };
  }, [selectedConversation, wsConnected]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Auto-initiate conversation from ChargerDetail
  useEffect(() => {
    if (!chatInitData || !chatInitData.hostId || !chatInitData.hostEmail) {
      return;
    }

    // Prevent re-running if already initiated
    if (chatInitiatedRef.current) {
      return;
    }

    console.log('🚀 AUTO-INITIATING conversation with host:', chatInitData);
    
    if (!wsConnected || loading) {
      console.log('⏳ Waiting for WebSocket...');
      return;
    }

    // Check if conversation already exists
    const existingConversation = conversations.find(
      conv => conv.otherParticipant && conv.otherParticipant.id === chatInitData.hostId
    );

    if (existingConversation) {
      console.log('✅ Found existing conversation');
      setSelectedConversation(existingConversation);
      if (isMobile) {
        setShowConversationList(false);
      }
      chatInitiatedRef.current = true;
      return;
    }

    console.log('🆕 Creating new conversation...');
    chatInitiatedRef.current = true;
    createConversationWithHost(chatInitData);

  }, [chatInitData, wsConnected, loading, conversations, isMobile]);

  // Reset the initiated flag when chatInitData changes
  useEffect(() => {
    if (chatInitData) {
      chatInitiatedRef.current = false;
    }
  }, [chatInitData?.hostId, chatInitData?.chargerId]);


  // ==================== WEBSOCKET FUNCTIONS ====================

  /**
   * Initialize WebSocket connection
   */
  const initWebSocket = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❌ No token found');
      setError('Authentication required. Please log in again.');
      return;
    }

    console.log('🔌 Initializing WebSocket connection...');
    setReconnecting(true);

    websocketService.connect(
      token,
      // On Connect
      () => {
        console.log('✅ WebSocket Connected Successfully');
        setWsConnected(true);
        setReconnecting(false);
        setError(null);
        
        // Subscribe to personal message queue
        websocketService.subscribe(
          '/user/queue/messages',
          handleIncomingMessage
        );
        
        // Subscribe to confirmations
        websocketService.subscribe(
          '/user/queue/confirmations',
          handleDeliveryConfirmation
        );

        console.log('✅ Subscribed to personal queues');
      },
      // On Error
      (error) => {
        console.error('❌ WebSocket Error:', error);
        setWsConnected(false);
        setReconnecting(false);
        setError('Connection failed. Retrying...');
      }
    );
  }, []);

  /**
   * Subscribe to conversation channels
   */
  const subscribeToConversation = useCallback(() => {
    if (!selectedConversation || !wsConnected) return;
    
    const conversationId = selectedConversation.id;
    
    // Unsubscribe from previous
    if (conversationSubRef.current) {
      websocketService.unsubscribe(conversationSubRef.current);
    }
    
    // Subscribe to conversation topic
    conversationSubRef.current = websocketService.subscribe(
      `/topic/messages/${conversationId}`,
      handleIncomingMessage
    );
    
    // Subscribe to typing indicators
    websocketService.subscribe(
      `/topic/typing/${conversationId}`,
      handleTypingIndicator
    );
    
    console.log(`📡 Subscribed to conversation ${conversationId}`);
  }, [selectedConversation, wsConnected]);

  /**
   * Handle incoming message
   */
  const handleIncomingMessage = useCallback((message) => {
    console.log('📨 New message received:', message);
    
    // If message belongs to current conversation, add it
    if (selectedConversation && message.conversationId === selectedConversation.id) {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.find(m => m.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });
      
      // Mark as read after a short delay
      setTimeout(() => markAsRead(), 500);
    }
    
    // Update conversation list to show new message
    refreshConversations();
  }, [selectedConversation]);

  /**
   * Handle delivery confirmation
   */
  const handleDeliveryConfirmation = useCallback((confirmation) => {
    console.log('✅ Delivery confirmation:', confirmation);
    
    setMessages(prev => 
      prev.map(msg => 
        msg.id === confirmation.messageId 
          ? { ...msg, status: confirmation.status }
          : msg
      )
    );
  }, []);

  /**
   * Handle typing indicator
   */
  const handleTypingIndicator = useCallback((indicator) => {
    console.log('⌨️ Typing indicator:', indicator);
    
    // Ignore own typing
    if (indicator.userId === currentUserId) return;
    
    setTyping(indicator.isTyping);
    
    // Auto-hide typing indicator after 3 seconds
    if (indicator.isTyping) {
      if (typingIndicatorTimeoutRef.current) {
        clearTimeout(typingIndicatorTimeoutRef.current);
      }
      
      typingIndicatorTimeoutRef.current = setTimeout(() => {
        setTyping(false);
      }, 3000);
    }
  }, [currentUserId]);

  // ==================== DATA LOADING FUNCTIONS ====================

  /**
   * Load all conversations
   */
  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📥 Loading conversations...');
      
      let response;
      if (conversationFilter === 'ALL') {
        response = await chatService.getConversations(0, 50);
      } else {
        response = await chatService.getConversationsByType(conversationFilter, 0, 50);
      }
      
      // Handle both Page response and direct array
      const conversationList = response.content || response;
      
      console.log('✅ Loaded conversations:', conversationList.length);
      setConversations(conversationList);
      
    } catch (err) {
      console.error('❌ Error loading conversations:', err);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh conversations (keep selected conversation)
   */
  const refreshConversations = async () => {
    try {
      let response;
      if (conversationFilter === 'ALL') {
        response = await chatService.getConversations(0, 50);
      } else {
        response = await chatService.getConversationsByType(conversationFilter, 0, 50);
      }
      
      const conversationList = response.content || response;
      setConversations(conversationList);
      
    } catch (err) {
      console.error('❌ Error refreshing conversations:', err);
    }
  };

  /**
   * Load specific conversation by ID
   */
  const loadSpecificConversation = async (conversationId) => {
    try {
      console.log('📥 Loading conversation:', conversationId);
      const conversation = await chatService.getConversation(conversationId);
      setSelectedConversation(conversation);
    } catch (err) {
      console.error('❌ Error loading conversation:', err);
      setError('Failed to load conversation.');
    }
  };

  /**
   * Initiate conversation with a user
   */
  const initiateConversationWithUser = async (otherUserId, conversationType = null, chargerId = null) => {
    try {
      console.log('🆕 Initiating conversation with user:', otherUserId);
      
      const request = {
        otherUserId: otherUserId,
        conversationType: conversationType,
        chargerId: chargerId
      };
      
      const conversation = await chatService.initiateConversation(request);
      setSelectedConversation(conversation);
      
      // Refresh conversation list
      await loadConversations();
      
    } catch (err) {
      console.error('❌ Error initiating conversation:', err);
      setError('Failed to initiate conversation.');
    }
  };
  
  /**
   * Create conversation with host from ChargerDetail
   */
  const createConversationWithHost = async (data) => {
    try {
      console.log('📞 Creating conversation with host:', data);
      
      const initialMessage = data.chargerName 
        ? `Hi! I'm interested in your charger: ${data.chargerName}. Is it available?`
        : `Hi! I have a question about your charger.`;

      const request = {
        participantId: data.hostId,
        conversationType: 'USER_HOST',
        chargerId: data.chargerId || null,
        initialMessage: initialMessage
      };

      console.log('📤 Sending request:', request);
      
      const newConversation = await chatService.initiateConversation(request);
      
      console.log('✅ Conversation created:', newConversation);
      
      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversation(newConversation);
      
      if (isMobile) {
        setShowConversationList(false);
      }
      
    } catch (error) {
      console.error('❌ Error:', error);
      setError('Failed to start conversation. Please try again.');
    }
  };

  /**
   * Load messages for selected conversation
   */
  const loadMessages = async () => {
    if (!selectedConversation) return;
    
    try {
      console.log('📥 Loading messages for conversation:', selectedConversation.id);
      
      const response = await chatService.getMessages(selectedConversation.id, 0, 50);
      const messageList = response.content || response;
      
      console.log('✅ Loaded messages:', messageList.length);
      setMessages(messageList);
      setCurrentPage(0);
      setHasMore(response.content ? !response.last : false);
      
    } catch (err) {
      console.error('❌ Error loading messages:', err);
      setError('Failed to load messages.');
    }
  };

  /**
   * Load more messages (pagination)
   */
  const loadMoreMessages = async () => {
    if (!selectedConversation || !hasMore) return;
    
    try {
      const nextPage = currentPage + 1;
      console.log('📥 Loading more messages, page:', nextPage);
      
      const response = await chatService.getMessages(selectedConversation.id, nextPage, 50);
      const olderMessages = response.content || response;
      
      setMessages(prev => [...olderMessages, ...prev]);
      setCurrentPage(nextPage);
      setHasMore(response.content ? !response.last : false);
      
    } catch (err) {
      console.error('❌ Error loading more messages:', err);
    }
  };

  /**
   * Mark conversation as read
   */
  const markAsRead = async () => {
    if (!selectedConversation) return;
    
    try {
      await chatService.markAsRead(selectedConversation.id);
      
      // Update conversation in list
      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
      
    } catch (err) {
      console.error('❌ Error marking as read:', err);
    }
  };

  // ==================== MESSAGE SENDING ====================

  /**
   * Send message via WebSocket
   */
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !selectedConversation) {
      return;
    }
    
    if (!wsConnected) {
      setError('Not connected to server. Please wait for connection...');
      return;
    }
    
    try {
      setSending(true);
      
      const messageRequest = {
        receiverId: selectedConversation.otherParticipant.userId,
        content: messageInput.trim(),
        conversationType: selectedConversation.conversationType,
        chargerId: selectedConversation.chargerContext?.chargerId
      };
      
      console.log('📤 Sending message via WebSocket:', messageRequest);
      
      // Send via WebSocket
      const success = websocketService.sendMessage('/app/chat.sendMessage', messageRequest);
      
      if (success) {
        setMessageInput('');
        websocketService.sendStopTyping(selectedConversation.id);
        console.log('✅ Message sent via WebSocket');
      } else {
        console.warn('⚠️ Message queued');
        setMessageInput('');
        setError('Message queued - sending when connected...');
        setTimeout(() => setError(null), 3000);
      }
      
    } catch (err) {
      console.error('❌ Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  /**
   * Handle input change with typing indicator
   */
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    
    if (!selectedConversation || !wsConnected) return;
    
    // Send typing indicator
    websocketService.sendTyping(selectedConversation.id);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing indicator after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      websocketService.sendStopTyping(selectedConversation.id);
    }, 2000);
  };

  // ==================== ADMIN FUNCTIONS ====================

  /**
   * Search users for admin (with debounce)
   */
  const handleUserSearch = async (term) => {
    setUserSearchTerm(term);
    
    if (term.length < 2) {
      setSearchedUsers([]);
      return;
    }
    
    // Debounce search
    if (userSearchTimeoutRef.current) {
      clearTimeout(userSearchTimeoutRef.current);
    }
    
    userSearchTimeoutRef.current = setTimeout(async () => {
      try {
        setSearchingUsers(true);
        
        const request = {
          searchTerm: term,
          page: 0,
          size: 10
        };
        
        console.log('🔍 Searching users:', term);
        const response = await chatService.searchUsersForAdminChat(request);
        
        const users = response.content || response;
        console.log('✅ Found users:', users.length);
        setSearchedUsers(users);
        
      } catch (err) {
        console.error('❌ Error searching users:', err);
      } finally {
        setSearchingUsers(false);
      }
    }, 500);
  };

  /**
   * Admin initiate chat with user
   */
  const handleAdminInitiateChat = async (targetUserId) => {
    try {
      console.log('👨‍💼 Admin initiating chat with user:', targetUserId);
      
      const conversation = await chatService.adminInitiateChat({
        targetUserId: targetUserId,
        initialMessage: null
      });
      
      setSelectedConversation(conversation);
      setShowUserSearch(false);
      setUserSearchTerm('');
      setSearchedUsers([]);
      
      // Refresh conversation list
      await loadConversations();
      
    } catch (err) {
      console.error('❌ Error initiating admin chat:', err);
      setError('Failed to start conversation.');
    }
  };

  // ==================== SUPPORT FUNCTIONS ====================

  /**
   * Load available admins for support
   */
  const loadAvailableAdmins = async () => {
    try {
      setLoadingAdmins(true);
      console.log('📞 Loading available admins...');
      
      const request = {
        searchTerm: '',
        roleFilter: 'ADMIN',
        page: 0,
        size: 10
      };
      
      const response = await chatService.searchUsersForAdminChat(request);
      const adminsList = response.content || response;
      
      console.log('✅ Found admins:', adminsList);
      setAvailableAdmins(adminsList);
      setShowAdminList(true);
      
    } catch (error) {
      console.error('❌ Error loading admins:', error);
      setError('Failed to load support team. Please try again.');
    } finally {
      setLoadingAdmins(false);
    }
  };

  /**
   * Initiate chat with admin
   */
  const contactAdmin = async (adminId) => {
    try {
      console.log('📞 Contacting admin:', adminId);
      
      // Check if conversation already exists
      const existingConversation = conversations.find(conv => {
        const isAdminConv = conv.conversationType === 'USER_ADMIN' || 
                           conv.conversationType === 'HOST_ADMIN';
        return isAdminConv && conv.otherParticipant.userId === adminId;
      });

      if (existingConversation) {
        console.log('✅ Existing admin conversation found');
        setSelectedConversation(existingConversation);
        setShowAdminList(false);
        if (isMobile) {
          setShowConversationList(false);
        }
        return;
      }

      // Create new support conversation
      const conversationType = isHost ? 'HOST_ADMIN' : 'USER_ADMIN';
      
      const request = {
        participantId: adminId,
        conversationType: conversationType
      };

      const conversation = await chatService.initiateConversation(request);
      console.log('✅ Created support conversation:', conversation);
      
      setConversations(prev => [conversation, ...prev]);
      setSelectedConversation(conversation);
      setShowAdminList(false);
      
      if (isMobile) {
        setShowConversationList(false);
      }

    } catch (error) {
      console.error('❌ Error contacting admin:', error);
      setError('Failed to contact support. Please try again.');
    }
  };

  // ==================== UI HELPER FUNCTIONS ====================

  /**
   * Handle conversation click
   */
  const handleConversationClick = (conversation) => {
    console.log('💬 Selected conversation:', conversation.id);
    setSelectedConversation(conversation);
  };

  /**
   * Handle back to conversation list (mobile)
   */
  const handleBackToList = () => {
    setSelectedConversation(null);
    setShowConversationList(true);
  };

  /**
   * Scroll to bottom of messages
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Format message time
   */
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM dd');
    }
  };

  /**
   * Format detailed time for message
   */
  const formatDetailedTime = (timestamp) => {
    if (!timestamp) return '';
    return format(new Date(timestamp), 'HH:mm');
  };

  /**
   * Get status icon for message
   */
  const getStatusIcon = (status) => {
    switch (status) {
      case 'SENT':
      case 'sent':
        return <MdDone size={16} />;
      case 'DELIVERED':
      case 'delivered':
        return <MdDoneAll size={16} />;
      case 'READ':
      case 'read':
        return <MdDoneAll size={16} className="read" />;
      default:
        return <MdDone size={16} />;
    }
  };

  /**
   * Filter conversations based on search term
   */
  const filteredConversations = conversations.filter(conv => {
    const searchMatch = 
      conv.otherParticipant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.otherParticipant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conv.lastMessage && conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return searchMatch;
  });

  /**
   * Reload conversations when filter changes
   */
  useEffect(() => {
    loadConversations();
  }, [conversationFilter]);

  // ==================== RENDER ====================

  return (
    <div className="chat-dashboard">
      {/* Connection Status Banner */}
      {!wsConnected && !loading && (
        <div className="connection-banner">
          <FiAlertCircle />
          <span>
            {reconnecting ? 'Reconnecting...' : 'Disconnected - Attempting to reconnect...'}
          </span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <FiAlertCircle />
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <FiX />
          </button>
        </div>
      )}

      {/* Conversations List */}
      <div className={`conversations-panel ${showConversationList ? 'show' : 'hide'}`}>
        {/* Header */}
        <div className="conversations-header">
          <h2>Messages</h2>
          <div className="header-actions">
            {/* Support Button for Users and Hosts */}
            {(isUser || isHost) && (
              <button 
                className="support-button"
                onClick={loadAvailableAdmins}
                title="Contact Support"
              >
                <FiHelpCircle size={18} />
                <span>Support</span>
              </button>
            )}
            
            {/* Admin User Search */}
            {isAdmin && (
              <button 
                className="icon-button"
                onClick={() => setShowUserSearch(!showUserSearch)}
                title="Search users to chat"
              >
                <FiUsers size={20} />
              </button>
            )}
            
            <button 
              className="icon-button"
              onClick={loadConversations}
              title="Refresh"
            >
              <FiRefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* Admin User Search */}
        {isAdmin && showUserSearch && (
          <div className="user-search-panel">
            <div className="search-header">
              <h3>Search Users</h3>
              <button onClick={() => {
                setShowUserSearch(false);
                setUserSearchTerm('');
                setSearchedUsers([]);
              }}>
                <FiX size={20} />
              </button>
            </div>
            
            <div className="search-input-container">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={userSearchTerm}
                onChange={(e) => handleUserSearch(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="search-results">
              {searchingUsers ? (
                <div className="loading-state">
                  <FiRefreshCw className="spinning" size={24} />
                  <p>Searching...</p>
                </div>
              ) : searchedUsers.length > 0 ? (
                searchedUsers.map(user => (
                  <div 
                    key={user.userId} 
                    className="user-search-item"
                    onClick={() => handleAdminInitiateChat(user.userId)}
                  >
                    <div className="avatar">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div className="user-info">
                      <h4>{user.firstName} {user.lastName}</h4>
                      <p>{user.email}</p>
                      <span className="role-badge">{user.role}</span>
                    </div>
                  </div>
                ))
              ) : userSearchTerm.length >= 2 ? (
                <div className="empty-state">
                  <p>No users found</p>
                </div>
              ) : (
                <div className="empty-state">
                  <p>Type at least 2 characters to search</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Admin List Modal for Support */}
        {(isUser || isHost) && showAdminList && (
          <div className="user-search-panel">
            <div className="search-header">
              <h3>Contact Support</h3>
              <button onClick={() => setShowAdminList(false)}>
                <FiX size={20} />
              </button>
            </div>
            
            <div className="search-results">
              {loadingAdmins ? (
                <div className="loading-state">
                  <FiRefreshCw className="spinning" size={24} />
                  <p>Loading support team...</p>
                </div>
              ) : availableAdmins.length > 0 ? (
                availableAdmins.map(admin => (
                  <div 
                    key={admin.userId} 
                    className="user-search-item"
                    onClick={() => contactAdmin(admin.userId)}
                  >
                    <div className="avatar">
                      {admin.firstName[0]}{admin.lastName[0]}
                      {admin.isOnline && <span className="online-dot"></span>}
                    </div>
                    <div className="user-info">
                      <h4>{admin.firstName} {admin.lastName}</h4>
                      <p>Support Agent</p>
                      <span className="role-badge">
                        {admin.isOnline ? '● Available' : '○ Offline'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <FiHelpCircle size={48} />
                  <p>No support agents available</p>
                  <small>Please try again later</small>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conversation Type Filter */}
        {!showUserSearch && !showAdminList && (
          <div className="conversation-filters">
            <button 
              className={conversationFilter === 'ALL' ? 'active' : ''}
              onClick={() => setConversationFilter('ALL')}
            >
              All
            </button>
            
            {isAdmin && (
              <>
                <button 
                  className={conversationFilter === 'USER_ADMIN' ? 'active' : ''}
                  onClick={() => setConversationFilter('USER_ADMIN')}
                >
                  Users
                </button>
                <button 
                  className={conversationFilter === 'HOST_ADMIN' ? 'active' : ''}
                  onClick={() => setConversationFilter('HOST_ADMIN')}
                >
                  Hosts
                </button>
              </>
            )}
            
            {isUser && (
              <>
                <button 
                  className={conversationFilter === 'USER_HOST' ? 'active' : ''}
                  onClick={() => setConversationFilter('USER_HOST')}
                >
                  Hosts
                </button>
                <button 
                  className={conversationFilter === 'USER_ADMIN' ? 'active' : ''}
                  onClick={() => setConversationFilter('USER_ADMIN')}
                >
                  Support
                </button>
              </>
            )}
            
            {isHost && (
              <>
                <button 
                  className={conversationFilter === 'USER_HOST' ? 'active' : ''}
                  onClick={() => setConversationFilter('USER_HOST')}
                >
                  Guests
                </button>
                <button 
                  className={conversationFilter === 'HOST_ADMIN' ? 'active' : ''}
                  onClick={() => setConversationFilter('HOST_ADMIN')}
                >
                  Support
                </button>
              </>
            )}
          </div>
        )}

        {/* Search */}
        {!showUserSearch && !showAdminList && (
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {/* Conversation List */}
        {!showUserSearch && !showAdminList && (
          <div className="conversations-list">
            {loading ? (
              <div className="loading-state">
                <FiRefreshCw className="spinning" size={32} />
                <p>Loading conversations...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="empty-state">
                <FiMessageSquare size={48} />
                <p>No conversations yet</p>
                <small>
                  {isAdmin 
                    ? 'Click the user icon to search and start chatting' 
                    : 'Start chatting with hosts or admins!'}
                </small>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`conversation-item ${
                    selectedConversation?.id === conversation.id ? 'active' : ''
                  }`}
                  onClick={() => handleConversationClick(conversation)}
                >
                  <div className="avatar">
                    {conversation.otherParticipant.firstName[0]}
                    {conversation.otherParticipant.lastName[0]}
                    {conversation.otherParticipant.isOnline && (
                      <span className="online-dot"></span>
                    )}
                  </div>
                  
                  <div className="conversation-info">
                    <div className="conversation-header-row">
                      <h4>
                        {conversation.otherParticipant.firstName}{' '}
                        {conversation.otherParticipant.lastName}
                      </h4>
                      <span className="time">
                        {formatMessageTime(conversation.lastMessageTime)}
                      </span>
                    </div>
                    
                    <div className="conversation-preview-row">
                      <p className="last-message">
                        {conversation.lastMessage || 'No messages yet'}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="unread-badge">
                          {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    
                    {conversation.conversationType && (
                      <span className="conversation-type">
                        {conversation.conversationType.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Chat View */}
      {selectedConversation ? (
        <div className="chat-view">
          {/* Chat Header */}
          <div className="chat-header">
            {isMobile && (
              <button onClick={handleBackToList} className="back-button">
                <FiArrowLeft size={20} />
              </button>
            )}
            <div className="chat-header-info">
              <div className="avatar">
                {selectedConversation.otherParticipant.firstName[0]}
                {selectedConversation.otherParticipant.lastName[0]}
                {selectedConversation.otherParticipant.isOnline && (
                  <span className="online-dot"></span>
                )}
              </div>
              <div>
                <h3>
                  {selectedConversation.otherParticipant.firstName}{' '}
                  {selectedConversation.otherParticipant.lastName}
                </h3>
                <span className={`status ${selectedConversation.otherParticipant.isOnline ? 'online' : 'offline'}`}>
                  {typing ? (
                    <span className="typing-text">typing...</span>
                  ) : (
                    selectedConversation.otherParticipant.isOnline 
                      ? 'Online' 
                      : selectedConversation.otherParticipant.lastSeen 
                        ? `Last seen ${formatDistanceToNow(new Date(selectedConversation.otherParticipant.lastSeen))} ago`
                        : 'Offline'
                  )}
                </span>
              </div>
            </div>
            <button className="more-button">
              <FiMoreVertical size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="messages-container" ref={messageListRef}>
            {hasMore && (
              <button onClick={loadMoreMessages} className="load-more-btn">
                Load older messages
              </button>
            )}
            
            {messages.map((message, index) => {
              const isMyMessage = message.senderId === currentUserId;
              const showDate = index === 0 || 
                new Date(message.createdAt).toDateString() !== 
                new Date(messages[index - 1].createdAt).toDateString();
              
              const senderInitial = message.senderName ? message.senderName.charAt(0).toUpperCase() : 'U';
              
              return (
                <React.Fragment key={message.id}>
                  {showDate && (
                    <div className="date-separator">
                      {isToday(new Date(message.createdAt))
                        ? 'Today'
                        : isYesterday(new Date(message.createdAt))
                        ? 'Yesterday'
                        : format(new Date(message.createdAt), 'MMMM dd, yyyy')}
                    </div>
                  )}
                  
                  <div
                    className={`message ${isMyMessage ? 'my-message' : 'their-message'}`}
                  >
                    {!isMyMessage && (
                      <div className="message-avatar">
                        {senderInitial}
                      </div>
                    )}
                    
                    <div className="message-bubble">
                      <p>{message.content}</p>
                      <div className="message-meta">
                        <span className="time">{formatDetailedTime(message.createdAt)}</span>
                        {isMyMessage && (
                          <span className="status-icon">
                            {getStatusIcon(message.status)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            
            {/* Typing Indicator */}
            {typing && (
              <div className="message their-message">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="message-input-container">
            <input
              type="text"
              value={messageInput}
              onChange={handleInputChange}
              placeholder={wsConnected ? "Type a message..." : "Connecting..."}
              disabled={sending || !wsConnected}
              autoFocus
            />
            <button 
              type="submit" 
              disabled={!messageInput.trim() || sending || !wsConnected}
              title={!wsConnected ? "Connecting to server..." : "Send message"}
            >
              <FiSend size={20} />
            </button>
          </form>
        </div>
      ) : (
        <div className="chat-placeholder">
          <FiMessageSquare size={64} />
          <h3>Select a conversation</h3>
          <p>Choose a conversation from the list to start chatting</p>
          {isAdmin && (
            <p className="admin-hint">
              <FiUsers /> Click the user icon to search and chat with users
            </p>
          )}
          {!wsConnected && (
            <p className="connection-status">
              <FiAlertCircle /> Establishing connection...
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatDashboard;