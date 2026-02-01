import React, { useState, useEffect } from "react";
import receiptService from "../../../../services/receiptService";
import "../../../../css/bookings/receiptModal.css";

const ReceiptModal = ({ bookingId, onClose }) => {
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        setLoading(true);
        const receiptData = await receiptService.getReceiptByBooking(bookingId);
        setReceipt(receiptData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch receipt:", err);
        setError(err.message || "Failed to load receipt");
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchReceipt();
    }
  }, [bookingId]);

  const handleDownload = async () => {
    if (!receipt) return;
    
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
    return `NPR ${parseFloat(amount).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="receipt-modal">
        <div className="modal-overlay" onClick={onClose}></div>
        <div className="modal-content receipt-modal-content">
          <button className="close-btn" onClick={onClose}>✖</button>
          <div className="receipt-loading">
            <div className="spinner"></div>
            <p>Loading receipt...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="receipt-modal">
        <div className="modal-overlay" onClick={onClose}></div>
        <div className="modal-content receipt-modal-content">
          <button className="close-btn" onClick={onClose}>✖</button>
          <div className="receipt-error">
            <div className="error-icon">❌</div>
            <h3>Unable to Load Receipt</h3>
            <p>{error}</p>
            <button className="btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="receipt-modal">
        <div className="modal-overlay" onClick={onClose}></div>
        <div className="modal-content receipt-modal-content">
          <button className="close-btn" onClick={onClose}>✖</button>
          <div className="receipt-error">
            <div className="error-icon">📄</div>
            <h3>Receipt Not Found</h3>
            <p>No receipt available for this booking</p>
            <button className="btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                <span className="info-label">Booking ID:</span>
                <span className="info-value">#{receipt.bookingId}</span>
              </div>
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
                <span className="info-label">Payment ID:</span>
                <span className="info-value">#{receipt.paymentId}</span>
              </div>
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
            <button 
              className="print-btn"
              onClick={() => window.print()}
            >
              🖨️ Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;