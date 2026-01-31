// src/components/dashboard/user/sections/PaymentModal.jsx
import React, { useState, useEffect } from "react";
import paymentService from "../../../../services/paymentService";
import PaymentTimer from "./PaymentTimer";
import "../../../../css/bookings/paymentModal.css";

const PaymentModal = ({ reservation, onSuccess, onClose, onExpire }) => {
  const [step, setStep] = useState("initiate"); // initiate, processing, success, failed
  const [paymentMethod, setPaymentMethod] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentId, setPaymentId] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

  const paymentMethods = paymentService.getPaymentMethods();

  const handleInitiatePayment = async () => {
    if (!paymentMethod) {
      setError("Please select a payment method");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await paymentService.initiatePayment({
        reservationId: reservation.reservationId,
        paymentMethod,
        remarks: remarks || undefined
      });

      setPaymentId(result.paymentId);
      setStep("confirm");
    } catch (err) {
      setError(err.message || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!paymentId) return;

    setLoading(true);
    setError("");
    setStep("processing");

    try {
      const result = await paymentService.processPayment({
        paymentId,
        confirmPayment: true
      });

      setPaymentResult(result);
      
      if (result.success) {
        setStep("success");
        setTimeout(() => {
          if (onSuccess) onSuccess(result);
        }, 2000);
      } else {
        setStep("failed");
      }
    } catch (err) {
      setError(err.message || "Payment failed");
      setStep("failed");
    } finally {
      setLoading(false);
    }
  };

  const handleExpire = () => {
    if (onExpire) onExpire();
  };

  const formatCurrency = (amount) => {
    return `Rs ${parseFloat(amount).toFixed(2)}`;
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="payment-modal">
      <div className="modal-overlay" onClick={step === "processing" ? undefined : onClose}></div>
      
      <div className="modal-content payment-modal-content">
        {step !== "processing" && step !== "success" && (
          <button 
            className="close-btn" 
            onClick={onClose}
            disabled={loading}
          >
            ✖
          </button>
        )}

        {/* Timer */}
        {reservation.reservedUntil && step !== "success" && (
          <PaymentTimer 
            reservedUntil={reservation.reservedUntil}
            onExpire={handleExpire}
          />
        )}

        {/* Payment Initiation Step */}
        {step === "initiate" && (
          <div className="payment-step">
            <h2 className="payment-title">💳 Complete Your Payment</h2>
            
            <div className="booking-summary">
              <h3>Booking Summary</h3>
              <div className="summary-row">
                <span>Charger:</span>
                <strong>{reservation.chargerName}</strong>
              </div>
              <div className="summary-row">
                <span>Start:</span>
                <strong>{formatDateTime(reservation.startTime)}</strong>
              </div>
              <div className="summary-row">
                <span>End:</span>
                <strong>{formatDateTime(reservation.endTime)}</strong>
              </div>
              <div className="summary-row">
                <span>Duration:</span>
                <strong>{reservation.durationMinutes} minutes</strong>
              </div>
              <div className="summary-row total">
                <span>Total Amount:</span>
                <strong className="amount">{formatCurrency(reservation.estimatedPrice)}</strong>
              </div>
            </div>

            {error && (
              <div className="error-message">
                ❌ {error}
              </div>
            )}

            <div className="payment-methods">
              <label className="form-label">Select Payment Method *</label>
              <div className="methods-grid">
                {paymentMethods.map((method) => (
                  <div
                    key={method.value}
                    className={`method-card ${paymentMethod === method.value ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod(method.value)}
                  >
                    <span className="method-icon">{method.icon}</span>
                    <span className="method-label">{method.label}</span>
                    {paymentMethod === method.value && (
                      <span className="check-icon">✓</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Remarks (Optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Add any notes about your payment..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
              />
            </div>

            <button
              className="submit-btn"
              onClick={handleInitiatePayment}
              disabled={loading || !paymentMethod}
            >
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  Initiating...
                </>
              ) : (
                "Proceed to Payment"
              )}
            </button>
          </div>
        )}

        {/* Confirmation Step */}
        {step === "confirm" && (
          <div className="payment-step">
            <h2 className="payment-title">✅ Confirm Payment</h2>
            
            <div className="confirmation-box">
              <div className="confirm-icon">💳</div>
              <p className="confirm-text">
                You are about to pay <strong>{formatCurrency(reservation.estimatedPrice)}</strong> via <strong>{paymentMethod}</strong>
              </p>
              <p className="confirm-subtext">
                This is a simulation. Click confirm to proceed.
              </p>
            </div>

            {error && (
              <div className="error-message">
                ❌ {error}
              </div>
            )}

            <div className="button-group">
              <button
                className="cancel-btn"
                onClick={() => setStep("initiate")}
                disabled={loading}
              >
                Go Back
              </button>
              <button
                className="submit-btn"
                onClick={handleProcessPayment}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    Confirming...
                  </>
                ) : (
                  "Confirm Payment"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Processing Step */}
        {step === "processing" && (
          <div className="payment-step processing-step">
            <div className="processing-animation">
              <div className="processing-spinner"></div>
              <h2>Processing Payment...</h2>
              <p>Please wait while we process your payment</p>
              <div className="processing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === "success" && paymentResult && (
          <div className="payment-step success-step">
            <div className="success-animation">
              <div className="success-icon">✅</div>
              <h2>Payment Successful!</h2>
              <p>Your booking has been confirmed</p>
            </div>

            <div className="payment-details">
              <div className="detail-row">
                <span>Transaction ID:</span>
                <strong>{paymentResult.transactionId}</strong>
              </div>
              <div className="detail-row">
                <span>Amount Paid:</span>
                <strong>{formatCurrency(paymentResult.amount)}</strong>
              </div>
              <div className="detail-row">
                <span>Payment Method:</span>
                <strong>{paymentMethod}</strong>
              </div>
            </div>

            <div className="success-message">
              🎉 Redirecting to your bookings...
            </div>
          </div>
        )}

        {/* Failed Step */}
        {step === "failed" && (
          <div className="payment-step failed-step">
            <div className="failed-icon">❌</div>
            <h2>Payment Failed</h2>
            <p className="error-text">
              {error || paymentResult?.message || "Something went wrong"}
            </p>

            <div className="button-group">
              <button
                className="cancel-btn"
                onClick={onClose}
              >
                Close
              </button>
              <button
                className="submit-btn retry-btn"
                onClick={() => {
                  setStep("initiate");
                  setError("");
                  setPaymentId(null);
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;