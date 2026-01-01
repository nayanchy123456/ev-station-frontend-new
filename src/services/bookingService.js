// src/services/bookingService.js
import api from "./api.js";

const bookingService = {
  /**
   * Create a new booking
   */
  createBooking: async (bookingData) => {
    try {
      const response = await api.post("/bookings", bookingData);
      return response.data;
    } catch (error) {
      console.error("Create booking error:", error);
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) throw new Error(errorData.message);
        if (errorData.details) {
          const messages = Object.values(errorData.details).join(", ");
          throw new Error(messages);
        }
      }
      throw new Error(error.message || "Failed to create booking");
    }
  },

  /**
   * Get current user's bookings
   */
  getMyBookings: async () => {
    try {
      const response = await api.get("/bookings/my");
      return response.data;
    } catch (error) {
      console.error("Get my bookings error:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch bookings");
    }
  },

  /**
   * ✅ NEW: Get bookings for host's chargers
   * @returns {Promise<Array>} List of bookings for all host's chargers
   */
  getBookingsByHost: async () => {
    try {
      const response = await api.get("/bookings/host");
      return response.data;
    } catch (error) {
      console.error("Get host bookings error:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch host bookings");
    }
  },

  /**
   * Get bookings for a specific charger
   */
  getChargerBookings: async (chargerId) => {
    try {
      const response = await api.get(`/bookings/charger/${chargerId}`);
      return response.data;
    } catch (error) {
      console.error("Get charger bookings error:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch charger bookings");
    }
  },

  /**
   * Cancel a booking
   */
  cancelBooking: async (bookingId) => {
    try {
      const response = await api.put(`/bookings/${bookingId}/cancel`);
      return response.data;
    } catch (error) {
      console.error("Cancel booking error:", error);
      throw new Error(error.response?.data?.message || "Failed to cancel booking");
    }
  },

  /**
   * Check if booking can be cancelled (within 1 hour rule)
   */
  canCancelBooking: (startTime) => {
    const start = new Date(startTime);
    const now = new Date();
    const hourBeforeStart = new Date(start.getTime() - 60 * 60 * 1000);
    return now < hourBeforeStart;
  },

  /**
   * Format datetime for backend (ISO string)
   */
  formatDateTimeForBackend: (dateTime) => {
    return new Date(dateTime).toISOString();
  },

  /**
   * Calculate booking duration in minutes
   */
  calculateDuration: (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.floor((end - start) / (1000 * 60));
  },

  /**
   * Calculate duration in hours
   */
  calculateDurationHours: (startTime, endTime) => {
    const minutes = bookingService.calculateDuration(startTime, endTime);
    return (minutes / 60).toFixed(2);
  },

  /**
   * Format duration as human-readable string
   */
  formatDuration: (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  },

  /**
   * Validate booking time according to backend rules
   */
  validateBookingTime: (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();
    const errors = [];

    if (start <= now) {
      errors.push("Start time must be in the future");
    }

    const minAdvanceTime = new Date(now.getTime() + 15 * 60 * 1000);
    if (start < minAdvanceTime) {
      errors.push("Booking must be at least 15 minutes in advance");
    }

    if (end <= start) {
      errors.push("End time must be after start time");
    }

    const duration = (end - start) / (1000 * 60);

    if (duration < 30) {
      errors.push("Minimum booking duration is 30 minutes");
    }

    if (duration > 480) {
      errors.push("Maximum booking duration is 8 hours");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Calculate estimated cost for a booking
   */
  calculateEstimatedCost: (durationMinutes, pricePerKwh, avgKw = 7) => {
    const hours = durationMinutes / 60;
    const estimatedKwh = hours * avgKw;
    return (estimatedKwh * pricePerKwh).toFixed(2);
  },

  /**
   * Get booking status color
   */
  getStatusColor: (status) => {
    const colors = {
      CONFIRMED: "#10b981",
      ACTIVE: "#3b82f6",
      COMPLETED: "#64748b",
      CANCELLED: "#ef4444"
    };
    return colors[status] || "#64748b";
  },

  /**
   * Get booking status display text
   */
  getStatusDisplayText: (status) => {
    const texts = {
      CONFIRMED: "Confirmed",
      ACTIVE: "Active",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled"
    };
    return texts[status] || status;
  },

  /**
   * Check if booking is upcoming
   */
  isUpcoming: (startTime, status) => {
    const now = new Date();
    const start = new Date(startTime);
    return status === "CONFIRMED" && start > now;
  },

  /**
   * Check if booking is in the past
   */
  isPast: (endTime, status) => {
    const now = new Date();
    const end = new Date(endTime);
    return (status === "COMPLETED" || status === "CANCELLED") || end < now;
  },

  /**
   * Get time until booking starts
   */
  getTimeUntilStart: (startTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const diff = start - now;
    
    if (diff < 0) return "Started";
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `In ${days}d ${hours % 24}h`;
    if (hours > 0) return `In ${hours}h ${minutes % 60}m`;
    return `In ${minutes}m`;
  },

  /**
   * Get minimum start time for booking (15 minutes from now)
   */
  getMinStartTime: () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    return now.toISOString().slice(0, 16);
  },

  /**
   * Get minimum end time based on start time (30 minutes after start)
   */
  getMinEndTime: (startTime) => {
    if (!startTime) return "";
    const start = new Date(startTime);
    start.setMinutes(start.getMinutes() + 30);
    return start.toISOString().slice(0, 16);
  },

  /**
   * Get maximum end time based on start time (8 hours after start)
   */
  getMaxEndTime: (startTime) => {
    if (!startTime) return "";
    const start = new Date(startTime);
    start.setHours(start.getHours() + 8);
    return start.toISOString().slice(0, 16);
  },

  /**
   * Sort bookings by start time (newest first)
   */
  sortByStartTime: (bookings, ascending = false) => {
    return [...bookings].sort((a, b) => {
      const timeA = new Date(a.startTime).getTime();
      const timeB = new Date(b.startTime).getTime();
      return ascending ? timeA - timeB : timeB - timeA;
    });
  },

  /**
   * Filter bookings by status
   */
  filterByStatus: (bookings, status) => {
    if (status === "ALL") return bookings;
    return bookings.filter(b => b.status === status);
  }
};

export default bookingService;