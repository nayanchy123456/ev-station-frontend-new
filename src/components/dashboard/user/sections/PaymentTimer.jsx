// src/components/dashboard/user/sections/PaymentTimer.jsx
import React, { useState, useEffect } from "react";
import reservationService from "../../../../services/reservationService";
import "../../../../css/bookings/paymentTimer.css";

/**
 * ✅ UPDATED: Changed from 10-minute to 3-minute reservation timeout
 * 
 * Payment Timer Component
 * Displays countdown timer for reservation expiry
 * Shows warning when less than 1 minute remaining
 */
const PaymentTimer = ({ reservedUntil, onExpire, showWarning = true }) => {
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);

  useEffect(() => {
    if (!reservedUntil) return;

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [reservedUntil]);

  const updateTimer = () => {
    const remaining = reservationService.getTimeRemaining(reservedUntil);
    setTimeLeft(remaining);
    setIsExpiringSoon(reservationService.isExpiringSoon(reservedUntil));

    // Check if expired
    if (remaining.expired && onExpire) {
      onExpire();
    }
  };

  // Format time as MM:SS
  const formattedTime = `${timeLeft.minutes}:${String(timeLeft.seconds).padStart(2, '0')}`;
  const totalSeconds = timeLeft.totalSeconds || 0;
  
  // ✅ CHANGED: 180 seconds = 3 minutes (was 600 seconds = 10 minutes)
  const percentage = Math.min(100, (totalSeconds / 180) * 100);

  if (timeLeft.expired) {
    return (
      <div className="payment-timer expired">
        <div className="timer-icon">⏱️</div>
        <div className="timer-content">
          <span className="timer-label">Reservation Expired</span>
          <span className="timer-value">00:00</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`payment-timer ${isExpiringSoon ? 'warning' : ''}`}>
      <div className="timer-icon">
        {isExpiringSoon ? '⚠️' : '⏰'}
      </div>
      <div className="timer-content">
        <span className="timer-label">Time to Complete Payment</span>
        <span className="timer-value">{formattedTime}</span>
      </div>
      <div className="timer-progress">
        <div 
          className="timer-progress-bar" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {showWarning && isExpiringSoon && (
        <div className="timer-warning">
          {/* ✅ CHANGED: Warning message updated for 3-minute timeout */}
          ⚠️ Less than 1 minute remaining!
        </div>
      )}
    </div>
  );
};

export default PaymentTimer;