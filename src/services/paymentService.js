// src/services/paymentService.js
import api from "./api.js";

const paymentService = {
  /**
   * Initiate payment for a reservation
   */
  initiatePayment: async (paymentData) => {
    try {
      const response = await api.post("/payments/initiate", paymentData);
      return response.data;
    } catch (error) {
      console.error("Initiate payment error:", error);
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) throw new Error(errorData.message);
      }
      throw new Error(error.message || "Failed to initiate payment");
    }
  },

  /**
   * Process payment (mock payment simulation)
   */
  processPayment: async (paymentData) => {
    try {
      const response = await api.post("/payments/process", paymentData);
      return response.data;
    } catch (error) {
      console.error("Process payment error:", error);
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) throw new Error(errorData.message);
      }
      throw new Error(error.message || "Payment processing failed");
    }
  },

  /**
   * Get payment by ID
   */
  getPaymentById: async (paymentId) => {
    try {
      const response = await api.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error("Get payment error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch payment"
      );
    }
  },

  /**
   * Get payment by booking ID
   */
  getPaymentByBooking: async (bookingId) => {
    try {
      const response = await api.get(`/payments/booking/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error("Get payment by booking error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch payment"
      );
    }
  },

  /**
   * Request refund for a payment
   */
  refundPayment: async (paymentId, reason) => {
    try {
      const response = await api.post(`/payments/refund/${paymentId}`, {
        reason,
      });
      return response.data;
    } catch (error) {
      console.error("Refund payment error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to process refund"
      );
    }
  },

  /**
   * Get available payment methods
   */
  getPaymentMethods: () => {
    return [
      { value: "eSewa", label: "eSewa", icon: "💳" },
      { value: "Khalti", label: "Khalti", icon: "📱" },
      { value: "Bank Transfer", label: "Bank Transfer", icon: "🏦" },
      { value: "Credit/Debit Card", label: "Credit/Debit Card", icon: "💳" },
    ];
  },

  /**
   * Get payment method icon
   */
  getPaymentMethodIcon: (method) => {
    const icons = {
      eSewa: "💳",
      Khalti: "📱",
      "Bank Transfer": "🏦",
      "Credit/Debit Card": "💳",
    };
    return icons[method] || "💰";
  },

  /**
   * Get payment status color
   */
  getPaymentStatusColor: (status) => {
    const colors = {
      PENDING: "#f59e0b",
      SUCCESS: "#10b981",
      FAILED: "#ef4444",
      REFUNDED: "#6366f1",
    };
    return colors[status] || "#64748b";
  },

  /**
   * Get payment status display text
   */
  getPaymentStatusText: (status) => {
    const texts = {
      PENDING: "Pending",
      SUCCESS: "Success",
      FAILED: "Failed",
      REFUNDED: "Refunded",
    };
    return texts[status] || status;
  },

  /**
   * Format currency amount
   */
  formatAmount: (amount, currency = "NPR") => {
    return `${currency} ${parseFloat(amount).toFixed(2)}`;
  },
};

export default paymentService;