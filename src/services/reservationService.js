// src/services/reservationService.js
import api from "./api.js";

const reservationService = {
  /**
   * Create a new reservation (3-minute window)
   */
  createReservation: async (reservationData) => {
    try {
      const response = await api.post("/reservations/create", reservationData);
      return response.data;
    } catch (error) {
      console.error("Create reservation error:", error);
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) throw new Error(errorData.message);
        if (errorData.details) {
          const messages = Object.values(errorData.details).join(", ");
          throw new Error(messages);
        }
      }
      throw new Error(error.message || "Failed to create reservation");
    }
  },

  /**
   * Get reservation by ID
   */
  getReservationById: async (reservationId) => {
    try {
      const response = await api.get(`/reservations/${reservationId}`);
      return response.data;
    } catch (error) {
      console.error("Get reservation error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch reservation"
      );
    }
  },

  /**
   * Get current user's reservations
   */
  getMyReservations: async () => {
    try {
      const response = await api.get("/reservations/my");
      return response.data;
    } catch (error) {
      console.error("Get my reservations error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch reservations"
      );
    }
  },

  /**
   * Calculate time remaining until reservation expires
   */
  getTimeRemaining: (reservedUntil) => {
    const now = new Date();
    const expiry = new Date(reservedUntil);
    const diff = expiry - now;

    if (diff <= 0) return { expired: true, minutes: 0, seconds: 0 };

    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { expired: false, minutes, seconds, totalSeconds: diff / 1000 };
  },

  /**
   * Format time remaining as string
   */
  formatTimeRemaining: (reservedUntil) => {
    const { expired, minutes, seconds } = reservationService.getTimeRemaining(
      reservedUntil
    );

    if (expired) return "Expired";

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  },

  /**
   * Check if reservation is about to expire (< 2 minutes)
   * FIXED: Changed from isExpiringsoon to isExpiringSoon (capital S)
   */
  isExpiringSoon: (reservedUntil) => {
    const { totalSeconds } = reservationService.getTimeRemaining(reservedUntil);
    return totalSeconds > 0 && totalSeconds < 120; // Less than 2 minutes
  },

  /**
   * Check if reservation has expired
   */
  hasExpired: (reservedUntil) => {
    return new Date(reservedUntil) < new Date();
  },
};

export default reservationService;