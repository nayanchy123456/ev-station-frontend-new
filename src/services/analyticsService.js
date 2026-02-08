import api from "./api";

/**
 * Analytics Service - API calls for host and user analytics
 */

// ==================== HOST ANALYTICS ====================

/**
 * Get host overview/KPI metrics
 * @param {string} period - LAST_7_DAYS, LAST_30_DAYS, or ALL_TIME
 */
export const getHostOverview = async (period = "LAST_7_DAYS") => {
  try {
    const response = await api.get(`/analytics/host/overview`, {
      params: { period },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching host overview:", error);
    throw error;
  }
};

/**
 * Get host revenue analytics
 * @param {string} period - LAST_7_DAYS, LAST_30_DAYS, or ALL_TIME
 */
export const getHostRevenue = async (period = "LAST_7_DAYS") => {
  try {
    const response = await api.get(`/analytics/host/revenue`, {
      params: { period },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching host revenue:", error);
    throw error;
  }
};

/**
 * Get host charger performance analytics
 * @param {string} period - LAST_7_DAYS, LAST_30_DAYS, or ALL_TIME
 */
export const getHostChargers = async (period = "LAST_7_DAYS") => {
  try {
    const response = await api.get(`/analytics/host/chargers`, {
      params: { period },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching host charger analytics:", error);
    throw error;
  }
};

/**
 * Get host booking analytics
 * @param {string} period - LAST_7_DAYS, LAST_30_DAYS, or ALL_TIME
 */
export const getHostBookings = async (period = "LAST_7_DAYS") => {
  try {
    const response = await api.get(`/analytics/host/bookings`, {
      params: { period },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching host booking analytics:", error);
    throw error;
  }
};

/**
 * Get host user behavior analytics
 * @param {string} period - LAST_7_DAYS, LAST_30_DAYS, or ALL_TIME
 */
export const getHostUsers = async (period = "LAST_7_DAYS") => {
  try {
    const response = await api.get(`/analytics/host/users`, {
      params: { period },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching host user analytics:", error);
    throw error;
  }
};

// ==================== USER ANALYTICS ====================

/**
 * Get user overview/KPI metrics
 * @param {string} period - LAST_7_DAYS, LAST_30_DAYS, or ALL_TIME
 */
export const getUserOverview = async (period = "LAST_7_DAYS") => {
  try {
    const response = await api.get(`/analytics/user/overview`, {
      params: { period },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user overview:", error);
    throw error;
  }
};

/**
 * Get user spending analytics
 * @param {string} period - LAST_7_DAYS, LAST_30_DAYS, or ALL_TIME
 */
export const getUserSpending = async (period = "LAST_7_DAYS") => {
  try {
    const response = await api.get(`/analytics/user/spending`, {
      params: { period },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user spending:", error);
    throw error;
  }
};

/**
 * Get user charging behavior analytics
 * @param {string} period - LAST_7_DAYS, LAST_30_DAYS, or ALL_TIME
 */
export const getUserChargingBehavior = async (period = "LAST_7_DAYS") => {
  try {
    const response = await api.get(`/analytics/user/charging-behavior`, {
      params: { period },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user charging behavior:", error);
    throw error;
  }
};

/**
 * Get user booking analytics
 * @param {string} period - LAST_7_DAYS, LAST_30_DAYS, or ALL_TIME
 */
export const getUserBookings = async (period = "LAST_7_DAYS") => {
  try {
    const response = await api.get(`/analytics/user/bookings`, {
      params: { period },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    throw error;
  }
};

/**
 * Get user rating analytics (always ALL_TIME)
 */
export const getUserRatings = async () => {
  try {
    const response = await api.get(`/analytics/user/ratings`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user ratings:", error);
    throw error;
  }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format currency in NPR (Nepalese Rupees)
 * UPDATED: Changed from INR to NPR
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "NPR 0.00";
  // NPR doesn't have native Intl support, so we format as number and add NPR prefix
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
 * Get trend icon and color based on comparison data
 */
export const getTrendInfo = (comparison) => {
  if (!comparison) return { icon: "→", color: "gray", text: "No change" };
  
  const isPositive = comparison.isIncrease;
  const percentage = Math.abs(comparison.changePercentage || 0);
  
  return {
    icon: isPositive ? "↑" : "↓",
    color: isPositive ? "green" : "red",
    text: `${isPositive ? "+" : "-"}${percentage.toFixed(1)}%`,
  };
};