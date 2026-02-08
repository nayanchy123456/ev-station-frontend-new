import React from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatNumber } from "../../services/analyticsService";

// ==================== STAT CARD ====================
export const StatCard = ({ title, value, subtitle, trend, icon, color = "blue" }) => {
  const trendColor = trend?.color || "gray";
  const trendIcon = trend?.icon || "";
  const trendText = trend?.text || "";

  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-header">
        <div className="stat-card-icon">{icon}</div>
        <h3 className="stat-card-title">{title}</h3>
      </div>
      <div className="stat-card-value">{value}</div>
      {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
      {trend && (
        <div className={`stat-card-trend trend-${trendColor}`}>
          <span className="trend-icon">{trendIcon}</span>
          <span className="trend-text">{trendText}</span>
        </div>
      )}
    </div>
  );
};

// ==================== LINE CHART ====================
export const RevenueLineChart = ({ data, dataKey = "value", title }) => {
  const formattedData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="date" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip
            formatter={(value) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="#4CAF50"
            strokeWidth={2}
            dot={{ fill: "#4CAF50", r: 4 }}
            activeDot={{ r: 6 }}
            name="Revenue"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// ==================== AREA CHART ====================
export const SpendingAreaChart = ({ data, title }) => {
  const formattedData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={formattedData}>
          <defs>
            <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2196F3" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#2196F3" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="date" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip
            formatter={(value) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#2196F3"
            fillOpacity={1}
            fill="url(#colorSpending)"
            name="Spending"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// ==================== BAR CHART ====================
export const BarChartComponent = ({ data, dataKey = "value", nameKey = "label", title, color = "#4CAF50" }) => {
  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey={nameKey} stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip
            formatter={(value) =>
              typeof value === "number" && value > 100
                ? formatCurrency(value)
                : formatNumber(value)
            }
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} name="Value" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ==================== PIE CHART ====================
const COLORS = ["#4CAF50", "#2196F3", "#FF9800", "#F44336", "#9C27B0", "#00BCD4"];

export const PieChartComponent = ({ data, title }) => {
  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ label, percentage }) => `${label}: ${percentage?.toFixed(1)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatNumber(value)}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// ==================== DONUT CHART ====================
export const DonutChartComponent = ({ data, title }) => {
  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ label, percentage }) => `${label}: ${percentage?.toFixed(1)}%`}
            outerRadius={80}
            innerRadius={50}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatNumber(value)}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// ==================== RATING DISTRIBUTION BAR CHART ====================
export const RatingDistributionChart = ({ distribution, title = "Rating Distribution" }) => {
  if (!distribution || !distribution.distribution) return null;

  const data = [5, 4, 3, 2, 1].map((stars) => ({
    stars: `${stars} ★`,
    count: distribution.distribution[stars]?.count || 0,
    percentage: distribution.distribution[stars]?.percentage || 0,
  }));

  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis type="number" stroke="#666" />
          <YAxis type="category" dataKey="stars" stroke="#666" />
          <Tooltip
            formatter={(value, name) => [
              name === "count" ? formatNumber(value) : `${value.toFixed(1)}%`,
              name === "count" ? "Count" : "Percentage",
            ]}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          />
          <Bar dataKey="count" fill="#FF9800" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};