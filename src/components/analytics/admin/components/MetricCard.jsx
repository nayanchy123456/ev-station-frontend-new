import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import "../../../../css/adminAnalytics/metricCard.css";

const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = "blue", 
  subtitle, 
  trend,
  loading = false 
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    return trend.isIncrease ? (
      <TrendingUp className="trend-icon trend-up" size={16} />
    ) : (
      <TrendingDown className="trend-icon trend-down" size={16} />
    );
  };

  const getTrendText = () => {
    if (!trend) return null;
    const prefix = trend.isIncrease ? "+" : "-";
    return `${prefix}${Math.abs(trend.changePercentage || 0).toFixed(1)}%`;
  };

  return (
    <div className={`metric-card metric-card-${color}`}>
      <div className="metric-header">
        <div className="metric-icon-wrapper">
          {Icon && <Icon className="metric-icon" size={24} />}
        </div>
        {trend && (
          <div className={`metric-trend ${trend.isIncrease ? 'trend-positive' : 'trend-negative'}`}>
            {getTrendIcon()}
            <span className="trend-text">{getTrendText()}</span>
          </div>
        )}
      </div>
      
      <div className="metric-content">
        <h3 className="metric-title">{title}</h3>
        {loading ? (
          <div className="metric-skeleton"></div>
        ) : (
          <p className="metric-value">{value}</p>
        )}
        {subtitle && <p className="metric-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
};

export default MetricCard;
