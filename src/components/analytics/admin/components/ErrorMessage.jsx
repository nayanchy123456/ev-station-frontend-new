import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import "../../../../css/adminAnalytics/errorMessage.css";

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="error-message-container">
      <div className="error-content">
        <AlertCircle className="error-icon" size={48} />
        <h3 className="error-title">Oops! Something went wrong</h3>
        <p className="error-text">{message}</p>
        {onRetry && (
          <button className="retry-button" onClick={onRetry}>
            <RefreshCw size={18} />
            <span>Try Again</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
