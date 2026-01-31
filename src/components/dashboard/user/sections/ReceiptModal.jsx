// src/components/dashboard/user/sections/ReceiptModal.jsx
import React, { useState } from "react";
import receiptService from "../../../../services/receiptService";
import "../../../../css/bookings/receiptModal.css";

const ReceiptModal = ({ receipt, onClose }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await receiptService.downloadReceipt(receipt.receiptId);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download receipt");
    } finally {
      setDownloading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `Rs ${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <div className="receipt-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      
      <div className="modal-content receipt-modal-content">
        <button className="close-btn" onClick={onClose}>✖</button>

        <div className="receipt-container">
          {/* Receipt Header */}
          <div className="receipt-header">
            <div className="receipt-icon">🧾</div>
            <h2>Payment Receipt</h2>
            <p className="receipt-number">
              {receiptService.formatReceiptNumber(receipt.receiptNumber)}
            </p>
          </div>

          {/* Receipt Details */}
          <div className="receipt-body">
            <div className="receipt-section">
              <h3 className="section-title">Customer Information</h3>
              <div className="info-row">
                <span className="info-label">Name:</span>
                <span className="info-value">{receipt.userName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{receipt.userEmail}</span>
              </div>
            </div>

            <div className="receipt-divider"></div>

            <div className="receipt-section">
              <h3 className="section-title">Booking Details</h3>
              <div className="info-row">
                <span className="info-label">Charger:</span>
                <span className="info-value">{receipt.chargerName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Start Time:</span>
                <span className="info-value">
                  {receiptService.formatReceiptDate(receipt.startTime)}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">End Time:</span>
                <span className="info-value">
                  {receiptService.formatReceiptDate(receipt.endTime)}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Duration:</span>
                <span className="info-value">
                  {receiptService.formatDuration(receipt.durationMinutes)}
                </span>
              </div>
            </div>

            <div className="receipt-divider"></div>

            <div className="receipt-section">
              <h3 className="section-title">Payment Information</h3>
              <div className="info-row">
                <span className="info-label">Payment Method:</span>
                <span className="info-value">{receipt.paymentMethod}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Transaction ID:</span>
                <span className="info-value transaction-id">
                  {receipt.transactionId}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Payment Date:</span>
                <span className="info-value">
                  {receiptService.formatReceiptDate(receipt.paymentDate)}
                </span>
              </div>
            </div>

            <div className="receipt-divider"></div>

            <div className="receipt-total">
              <span className="total-label">Total Amount Paid</span>
              <span className="total-value">
                {formatCurrency(receipt.amount)}
              </span>
            </div>
          </div>

          {/* Receipt Footer */}
          <div className="receipt-footer">
            <p className="footer-text">
              This is a computer-generated receipt. No signature required.
            </p>
            <p className="footer-date">
              Generated on {receiptService.formatReceiptDate(receipt.generatedAt)}
            </p>
          </div>

          {/* Actions */}
          <div className="receipt-actions">
            <button 
              className="download-btn"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <>
                  <span className="btn-spinner"></span>
                  Downloading...
                </>
              ) : (
                <>
                  📥 Download Receipt
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;