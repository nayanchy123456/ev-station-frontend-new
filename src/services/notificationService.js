// src/services/notificationService.js
import api from "./api.js";

const notificationService = {
  /**
   * Get all notifications for current user
   */
  getNotifications: async () => {
    try {
      const response = await api.get("/notifications");
      return response.data;
    } catch (error) {
      console.error("Get notifications error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch notifications"
      );
    }
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async () => {
    try {
      const response = await api.get("/notifications/unread-count");
      return response.data.unreadCount || 0;
    } catch (error) {
      console.error("Get unread count error:", error);
      return 0;
    }
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error("Mark as read error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to mark notification as read"
      );
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    try {
      const response = await api.put("/notifications/mark-all-read");
      return response.data;
    } catch (error) {
      console.error("Mark all as read error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to mark all as read"
      );
    }
  },

  /**
   * Delete notification
   */
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error("Delete notification error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to delete notification"
      );
    }
  },

  /**
   * Get notification icon based on type
   */
  getNotificationIcon: (type) => {
    const icons = {
      BOOKING_CONFIRMED: "✅",
      BOOKING_CANCELLED: "❌",
      BOOKING_ACTIVE: "⚡",
      BOOKING_COMPLETED: "✓",
      PAYMENT_SUCCESS: "💰",
      PAYMENT_FAILED: "⚠️",
      REFUND_PROCESSED: "💸",
      RESERVATION_EXPIRING: "⏰",
      RESERVATION_EXPIRED: "🕐",
    };
    return icons[type] || "🔔";
  },

  /**
   * Get notification color based on type
   */
  getNotificationColor: (type) => {
    const colors = {
      BOOKING_CONFIRMED: "#10b981",
      BOOKING_CANCELLED: "#ef4444",
      BOOKING_ACTIVE: "#3b82f6",
      BOOKING_COMPLETED: "#64748b",
      PAYMENT_SUCCESS: "#10b981",
      PAYMENT_FAILED: "#ef4444",
      REFUND_PROCESSED: "#6366f1",
      RESERVATION_EXPIRING: "#f59e0b",
      RESERVATION_EXPIRED: "#ef4444",
    };
    return colors[type] || "#64748b";
  },

  /**
   * Format notification time as relative
   */
  formatRelativeTime: (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  },

  /**
   * Group notifications by date
   */
  groupByDate: (notifications) => {
    const groups = {
      today: [],
      yesterday: [],
      earlier: [],
    };

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    notifications.forEach((notif) => {
      const notifDate = new Date(notif.createdAt).toDateString();

      if (notifDate === today) {
        groups.today.push(notif);
      } else if (notifDate === yesterday) {
        groups.yesterday.push(notif);
      } else {
        groups.earlier.push(notif);
      }
    });

    return groups;
  },

  /**
   * Filter notifications by type
   */
  filterByType: (notifications, type) => {
    if (!type || type === "ALL") return notifications;
    return notifications.filter((n) => n.type === type);
  },

  /**
   * Sort notifications (newest first)
   */
  sortByNewest: (notifications) => {
    return [...notifications].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  },
};

export default notificationService;