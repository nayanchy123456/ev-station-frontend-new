import React from "react";
import "../../../../css/adminAnalytics/chartCard.css";

const ChartCard = ({ title, subtitle, children, action }) => {
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div className="chart-card-title-section">
          <h3 className="chart-card-title">{title}</h3>
          {subtitle && <p className="chart-card-subtitle">{subtitle}</p>}
        </div>
        {action && <div className="chart-card-action">{action}</div>}
      </div>
      <div className="chart-card-content">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
