import api from "./api";

/**
 * Rating Service
 * Handles all rating-related API calls
 */
const ratingService = {
  /**
   * Create a new rating for a completed booking
   * @param {Object} ratingData - { bookingId, ratingScore, comment }
   * @returns {Promise<Object>} Created rating
   */
  createRating: async (ratingData) => {
    try {
      const response = await api.post("/ratings", ratingData);
      console.log("✅ Rating created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error creating rating:", error.response?.data || error);
      throw new Error(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to submit rating"
      );
    }
  },

  /**
   * Update an existing rating
   * @param {number} ratingId - ID of the rating to update
   * @param {Object} ratingData - { bookingId, ratingScore, comment }
   * @returns {Promise<Object>} Updated rating
   */
  updateRating: async (ratingId, ratingData) => {
    try {
      const response = await api.put(`/ratings/${ratingId}`, ratingData);
      console.log("✅ Rating updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error updating rating:", error.response?.data || error);
      throw new Error(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to update rating"
      );
    }
  },

  /**
   * Delete a rating
   * @param {number} ratingId - ID of the rating to delete
   * @returns {Promise<Object>} Success message
   */
  deleteRating: async (ratingId) => {
    try {
      const response = await api.delete(`/ratings/${ratingId}`);
      console.log("✅ Rating deleted successfully");
      return response.data;
    } catch (error) {
      console.error("❌ Error deleting rating:", error.response?.data || error);
      throw new Error(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to delete rating"
      );
    }
  },

  /**
   * Get rating by ID
   * @param {number} ratingId - ID of the rating
   * @returns {Promise<Object>} Rating details
   */
  getRatingById: async (ratingId) => {
    try {
      const response = await api.get(`/ratings/${ratingId}`);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching rating:", error.response?.data || error);
      throw new Error(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch rating"
      );
    }
  },

  /**
   * Get rating for a specific booking
   * @param {number} bookingId - ID of the booking
   * @returns {Promise<Object|null>} Rating if exists, null otherwise
   */
  getRatingByBookingId: async (bookingId) => {
    try {
      const response = await api.get(`/ratings/booking/${bookingId}`);
      return response.data;
    } catch (error) {
      // Return null if no rating exists (404)
      if (error.response?.status === 404) {
        return null;
      }
      console.error("❌ Error fetching booking rating:", error.response?.data || error);
      throw new Error(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch rating"
      );
    }
  },

  /**
   * Get all ratings for a charger with pagination
   * @param {number} chargerId - ID of the charger
   * @param {number} page - Page number (default: 0)
   * @param {number} size - Page size (default: 10)
   * @returns {Promise<Object>} Paginated ratings { content, totalElements, totalPages, etc. }
   */
  getChargerRatings: async (chargerId, page = 0, size = 10) => {
    try {
      const response = await api.get(`/ratings/charger/${chargerId}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching charger ratings:", error.response?.data || error);
      throw new Error(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch ratings"
      );
    }
  },

  /**
   * Get rating summary and statistics for a charger
   * @param {number} chargerId - ID of the charger
   * @returns {Promise<Object>} Summary with averageRating, totalRatings, star distribution
   */
  getChargerRatingSummary: async (chargerId) => {
    try {
      const response = await api.get(`/ratings/charger/${chargerId}/summary`);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching rating summary:", error.response?.data || error);
      // Return default summary if charger has no ratings yet
      if (error.response?.status === 404) {
        return {
          chargerId,
          chargerName: "",
          averageRating: 0,
          totalRatings: 0,
          fiveStarCount: 0,
          fourStarCount: 0,
          threeStarCount: 0,
          twoStarCount: 0,
          oneStarCount: 0
        };
      }
      throw new Error(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch rating summary"
      );
    }
  },

  /**
   * Get all ratings submitted by the authenticated user
   * @param {number} page - Page number (default: 0)
   * @param {number} size - Page size (default: 10)
   * @returns {Promise<Object>} Paginated user ratings
   */
  getMyRatings: async (page = 0, size = 10) => {
    try {
      const response = await api.get("/ratings/my-ratings", {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching user ratings:", error.response?.data || error);
      throw new Error(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch your ratings"
      );
    }
  },

  /**
   * Check if user can rate a specific booking
   * @param {number} bookingId - ID of the booking
   * @returns {Promise<boolean>} true if user can rate, false otherwise
   */
  canRateBooking: async (bookingId) => {
    try {
      const response = await api.get(`/ratings/can-rate/${bookingId}`);
      return response.data.canRate;
    } catch (error) {
      console.error("❌ Error checking rating eligibility:", error.response?.data || error);
      return false;
    }
  },

  /**
   * Format rating date for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  formatRatingDate: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  },

  /**
   * Calculate star distribution percentages
   * @param {Object} summary - Rating summary object
   * @returns {Array} Array of star data with percentages
   */
  calculateStarDistribution: (summary) => {
    if (!summary || summary.totalRatings === 0) {
      return [
        { stars: 5, count: 0, percentage: 0 },
        { stars: 4, count: 0, percentage: 0 },
        { stars: 3, count: 0, percentage: 0 },
        { stars: 2, count: 0, percentage: 0 },
        { stars: 1, count: 0, percentage: 0 }
      ];
    }

    return [
      {
        stars: 5,
        count: summary.fiveStarCount,
        percentage: ((summary.fiveStarCount / summary.totalRatings) * 100).toFixed(1)
      },
      {
        stars: 4,
        count: summary.fourStarCount,
        percentage: ((summary.fourStarCount / summary.totalRatings) * 100).toFixed(1)
      },
      {
        stars: 3,
        count: summary.threeStarCount,
        percentage: ((summary.threeStarCount / summary.totalRatings) * 100).toFixed(1)
      },
      {
        stars: 2,
        count: summary.twoStarCount,
        percentage: ((summary.twoStarCount / summary.totalRatings) * 100).toFixed(1)
      },
      {
        stars: 1,
        count: summary.oneStarCount,
        percentage: ((summary.oneStarCount / summary.totalRatings) * 100).toFixed(1)
      }
    ];
  }
};

export default ratingService;