// src/services/receiptService.js
import api from "./api.js";

const receiptService = {
  /**
   * Get receipt by receipt ID
   */
  getReceiptById: async (receiptId) => {
    try {
      const response = await api.get(`/receipts/${receiptId}`);
      return response.data;
    } catch (error) {
      console.error("Get receipt error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch receipt"
      );
    }
  },

  /**
   * Get receipt by booking ID
   */
  getReceiptByBooking: async (bookingId) => {
    try {
      const response = await api.get(`/receipts/booking/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error("Get receipt by booking error:", error);
      throw new Error(
        error.response?.data?.message || "Receipt not found for this booking"
      );
    }
  },

  /**
   * Download receipt as text file
   */
  downloadReceipt: async (receiptId) => {
    try {
      const response = await api.get(`/receipts/download/${receiptId}`, {
        responseType: "blob",
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `receipt-${receiptId}.txt`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      return true;
    } catch (error) {
      console.error("Download receipt error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to download receipt"
      );
    }
  },

  /**
   * Format receipt date/time
   */
  formatReceiptDateTime: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  },

  /**
   * Calculate duration in minutes
   */
  calculateDuration: (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.floor((end - start) / (1000 * 60));
  },

  /**
   * Format duration as human-readable
   */
  formatDuration: (durationMinutes) => {
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  },

  /**
   * Print receipt
   */
  printReceipt: () => {
    window.print();
  },

  /**
   * Share receipt (future enhancement)
   */
  shareReceipt: async (receiptData) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Receipt ${receiptData.receiptNumber}`,
          text: `Receipt for booking ${receiptData.chargerName}`,
          url: window.location.href,
        });
        return true;
      } catch (error) {
        console.error("Share error:", error);
        return false;
      }
    }
    return false;
  },
};

export default receiptService;