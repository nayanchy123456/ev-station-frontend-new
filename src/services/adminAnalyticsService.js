import api from "./api";

/**
 * Admin Analytics Service - API calls for comprehensive platform analytics
 * All endpoints require ADMIN role authorization
 */

// ==================== ADMIN ANALYTICS ENDPOINTS ====================

/**
 * Get admin overview/dashboard analytics
 * @param {string} startDate - Start date in ISO format (YYYY-MM-DD)
 * @param {string} endDate - End date in ISO format (YYYY-MM-DD)
 * @returns {Promise<AdminOverviewDTO>}
 */
export const getAdminOverview = async (startDate, endDate) => {
  try {
    const response = await api.get(`/analytics/admin/overview`, {
      params: { startDate, endDate },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching admin overview:", error);
    throw error;
  }
};

/**
 * Get admin user analytics
 * @param {string} startDate - Start date in ISO format (YYYY-MM-DD)
 * @param {string} endDate - End date in ISO format (YYYY-MM-DD)
 * @returns {Promise<AdminUserAnalyticsDTO>}
 */
export const getAdminUserAnalytics = async (startDate, endDate) => {
  try {
    const response = await api.get(`/analytics/admin/users`, {
      params: { startDate, endDate },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching admin user analytics:", error);
    throw error;
  }
};

/**
 * Get admin host analytics
 * @param {string} startDate - Start date in ISO format (YYYY-MM-DD)
 * @param {string} endDate - End date in ISO format (YYYY-MM-DD)
 * @returns {Promise<AdminHostAnalyticsDTO>}
 */
export const getAdminHostAnalytics = async (startDate, endDate) => {
  try {
    const response = await api.get(`/analytics/admin/hosts`, {
      params: { startDate, endDate },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching admin host analytics:", error);
    throw error;
  }
};

/**
 * Get admin charger analytics
 * @param {string} startDate - Start date in ISO format (YYYY-MM-DD)
 * @param {string} endDate - End date in ISO format (YYYY-MM-DD)
 * @returns {Promise<AdminChargerAnalyticsDTO>}
 */
export const getAdminChargerAnalytics = async (startDate, endDate) => {
  try {
    const response = await api.get(`/analytics/admin/chargers`, {
      params: { startDate, endDate },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching admin charger analytics:", error);
    throw error;
  }
};

/**
 * Get admin booking analytics
 * @param {string} startDate - Start date in ISO format (YYYY-MM-DD)
 * @param {string} endDate - End date in ISO format (YYYY-MM-DD)
 * @returns {Promise<AdminBookingAnalyticsDTO>}
 */
export const getAdminBookingAnalytics = async (startDate, endDate) => {
  try {
    const response = await api.get(`/analytics/admin/bookings`, {
      params: { startDate, endDate },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching admin booking analytics:", error);
    throw error;
  }
};

/**
 * Get admin revenue analytics
 * @param {string} startDate - Start date in ISO format (YYYY-MM-DD)
 * @param {string} endDate - End date in ISO format (YYYY-MM-DD)
 * @returns {Promise<AdminRevenueAnalyticsDTO>}
 */
export const getAdminRevenueAnalytics = async (startDate, endDate) => {
  try {
    const response = await api.get(`/analytics/admin/revenue`, {
      params: { startDate, endDate },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching admin revenue analytics:", error);
    throw error;
  }
};

/**
 * Get admin rating analytics
 * @param {string} startDate - Start date in ISO format (YYYY-MM-DD)
 * @param {string} endDate - End date in ISO format (YYYY-MM-DD)
 * @returns {Promise<AdminRatingAnalyticsDTO>}
 */
export const getAdminRatingAnalytics = async (startDate, endDate) => {
  try {
    const response = await api.get(`/analytics/admin/ratings`, {
      params: { startDate, endDate },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching admin rating analytics:", error);
    throw error;
  }
};

/**
 * Get admin platform performance analytics
 * @param {string} startDate - Start date in ISO format (YYYY-MM-DD)
 * @param {string} endDate - End date in ISO format (YYYY-MM-DD)
 * @returns {Promise<AdminPlatformPerformanceDTO>}
 */
export const getAdminPlatformPerformance = async (startDate, endDate) => {
  try {
    const response = await api.get(`/analytics/admin/platform-performance`, {
      params: { startDate, endDate },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching admin platform performance:", error);
    throw error;
  }
};

/**
 * Get admin time analytics
 * @param {string} startDate - Start date in ISO format (YYYY-MM-DD)
 * @param {string} endDate - End date in ISO format (YYYY-MM-DD)
 * @returns {Promise<AdminTimeAnalyticsDTO>}
 */
export const getAdminTimeAnalytics = async (startDate, endDate) => {
  try {
    const response = await api.get(`/analytics/admin/time-analytics`, {
      params: { startDate, endDate },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching admin time analytics:", error);
    throw error;
  }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get date range presets for analytics
 */
export const getDateRangePresets = () => {
  const today = new Date();
  const formatDate = (date) => date.toISOString().split("T")[0];

  return {
    TODAY: {
      label: "Today",
      startDate: formatDate(today),
      endDate: formatDate(today),
    },
    LAST_7_DAYS: {
      label: "Last 7 Days",
      startDate: formatDate(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)),
      endDate: formatDate(today),
    },
    LAST_30_DAYS: {
      label: "Last 30 Days",
      startDate: formatDate(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)),
      endDate: formatDate(today),
    },
    LAST_90_DAYS: {
      label: "Last 90 Days",
      startDate: formatDate(new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)),
      endDate: formatDate(today),
    },
    THIS_MONTH: {
      label: "This Month",
      startDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
      endDate: formatDate(today),
    },
    LAST_MONTH: {
      label: "Last Month",
      startDate: formatDate(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
      endDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 0)),
    },
    THIS_YEAR: {
      label: "This Year",
      startDate: formatDate(new Date(today.getFullYear(), 0, 1)),
      endDate: formatDate(today),
    },
  };
};

/**
 * Format currency in NPR (Nepalese Rupees)
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "NPR 0.00";
  const formatted = new Intl.NumberFormat("en-NP", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `NPR ${formatted}`;
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (!value && value !== 0) return "0%";
  return `${parseFloat(value).toFixed(decimals)}%`;
};

/**
 * Format number with commas
 */
export const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return new Intl.NumberFormat("en-IN").format(num);
};

/**
 * Calculate growth percentage
 */
export const calculateGrowth = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Get status badge color
 */
export const getStatusColor = (status) => {
  const statusColors = {
    COMPLETED: "green",
    ACTIVE: "blue",
    PENDING: "yellow",
    CANCELLED: "red",
    REJECTED: "red",
    APPROVED: "green",
  };
  return statusColors[status] || "gray";
};
