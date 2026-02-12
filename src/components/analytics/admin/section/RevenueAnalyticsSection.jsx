import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Zap, RefreshCcw } from "lucide-react";
import "../../../../services/charRegistration.js";
import { getAdminRevenueAnalytics, formatNumber, formatCurrency, formatPercentage } from "../../../../services/adminAnalyticsService";
import MetricCard from "../components/MetricCard";
import ChartCard from "../components/ChartCard";
import DataTable from "../components/DataTable";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { Line, Bar, Doughnut } from "react-chartjs-2";

const RevenueAnalyticsSection = ({ startDate, endDate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchRevenueAnalytics(); }, [startDate, endDate]);

  const fetchRevenueAnalytics = async () => {
    try {
      setLoading(true); setError(null);
      const response = await getAdminRevenueAnalytics(startDate, endDate);
      setData(response);
    } catch (err) {
      setError("Failed to load revenue analytics. Please try again.");
    } finally { setLoading(false); }
  };

  if (loading) return <LoadingSpinner message="Loading revenue analytics..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchRevenueAnalytics} />;
  if (!data) return null;

  // Backend: revenueByMonth[].month, .revenue, .bookingCount
  const monthlyRevenueData = {
    labels: data.revenueByMonth?.map((m) => m.month) || [],
    datasets: [{ label: "Revenue (NPR)", data: data.revenueByMonth?.map((m) => Number(m.revenue) || 0) || [],
      borderColor: "rgb(16,185,129)", backgroundColor: "rgba(16,185,129,0.1)", fill: true, tension: 0.4 }],
  };

  // Backend: paymentMethodDistribution[].paymentMethod, .count, .totalAmount, .percentage
  const paymentMethodData = {
    labels: data.paymentMethodDistribution?.map((p) => p.paymentMethod) || [],
    datasets: [{ data: data.paymentMethodDistribution?.map((p) => Number(p.totalAmount) || 0) || [],
      backgroundColor: ["rgba(59,130,246,0.8)","rgba(16,185,129,0.8)","rgba(245,158,11,0.8)","rgba(236,72,153,0.8)"] }],
  };

  // Backend: revenueByLocation[].location, .revenue, .bookingCount, .chargerCount
  const locationRevenueData = {
    labels: data.revenueByLocation?.slice(0, 8).map((l) => l.location) || [],
    datasets: [{ label: "Revenue", data: data.revenueByLocation?.slice(0, 8).map((l) => Number(l.revenue) || 0) || [],
      backgroundColor: "rgba(59,130,246,0.8)" }],
  };

  // Backend: revenueByCharger[].chargerId, .chargerName, .revenue, .bookingCount
  const chargerRevenueColumns = [
    { key: "chargerName", label: "Charger" },
    { key: "revenue", label: "Revenue", render: (v) => formatCurrency(v) },
    { key: "bookingCount", label: "Bookings", render: (v) => formatNumber(v) },
  ];

  // Backend: revenueByHost[].hostId, .hostName, .revenue, .bookingCount, .chargerCount
  const hostRevenueColumns = [
    { key: "hostName", label: "Host" },
    { key: "revenue", label: "Revenue", render: (v) => formatCurrency(v) },
    { key: "bookingCount", label: "Bookings", render: (v) => formatNumber(v) },
    { key: "chargerCount", label: "Chargers", render: (v) => formatNumber(v) },
  ];

  // Backend: revenueByLocation[].location, .revenue, .bookingCount, .chargerCount
  const locationColumns = [
    { key: "location", label: "Location" },
    { key: "revenue", label: "Revenue", render: (v) => formatCurrency(v) },
    { key: "bookingCount", label: "Bookings", render: (v) => formatNumber(v) },
    { key: "chargerCount", label: "Chargers", render: (v) => formatNumber(v) },
  ];

  // Payment method table
  const paymentColumns = [
    { key: "paymentMethod", label: "Method" },
    { key: "count", label: "Count", render: (v) => formatNumber(v) },
    { key: "totalAmount", label: "Total Amount", render: (v) => formatCurrency(v) },
    { key: "percentage", label: "Share", render: (v) => formatPercentage(v) },
  ];

  const chartOptions = { responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } };
  const doughnutOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } };

  const isGrowthPositive = (data.revenueGrowthRate || 0) >= 0;

  return (
    <div className="revenue-analytics-section">
      <div className="metrics-grid">
        {/* Backend: totalRevenue */}
        <MetricCard title="Total Revenue" value={formatCurrency(data.totalRevenue)} icon={DollarSign} color="emerald" subtitle="All-time earnings" />
        {/* Backend: revenueGrowthRate */}
        <MetricCard title="Revenue Growth" value={formatPercentage(data.revenueGrowthRate)}
          icon={isGrowthPositive ? TrendingUp : TrendingDown} color={isGrowthPositive ? "green" : "red"}
          subtitle="vs previous period" />
        {/* Backend: averageRevenuePerBooking */}
        <MetricCard title="Avg Revenue / Booking" value={formatCurrency(data.averageRevenuePerBooking)} icon={CreditCard} color="blue" subtitle="Per booking average" />
        {/* Backend: averageTransactionValue */}
        <MetricCard title="Avg Transaction Value" value={formatCurrency(data.averageTransactionValue)} icon={DollarSign} color="purple" subtitle="Per payment" />
        {/* Backend: revenuePerUser */}
        <MetricCard title="Revenue / User" value={formatCurrency(data.revenuePerUser)} icon={TrendingUp} color="amber" subtitle="ARPU" />
        {/* Backend: revenuePerCharger */}
        <MetricCard title="Revenue / Charger" value={formatCurrency(data.revenuePerCharger)} icon={Zap} color="teal" subtitle="Per charger average" />
        {/* Backend: paymentSuccessRate */}
        <MetricCard title="Payment Success Rate" value={formatPercentage(data.paymentSuccessRate)} icon={CreditCard} color="green" subtitle="Successful payments" />
        {/* Backend: failedPaymentCount */}
        <MetricCard title="Failed Payments" value={formatNumber(data.failedPaymentCount)} icon={TrendingDown} color="red" subtitle="Failed transactions" />
        {/* Backend: totalEnergyConsumedKwh */}
        <MetricCard title="Total Energy" value={`${(data.totalEnergyConsumedKwh || 0).toFixed(2)} kWh`} icon={Zap} color="rose" subtitle="Consumed energy" />
        {/* Backend: refundStatistics.totalRefunds */}
        <MetricCard title="Total Refunds" value={formatNumber(data.refundStatistics?.totalRefunds)} icon={RefreshCcw} color="orange" subtitle={formatCurrency(data.refundStatistics?.totalRefundAmount)} />
      </div>

      <div className="charts-grid">
        <ChartCard title="Monthly Revenue Trend">
          <Line data={monthlyRevenueData} options={chartOptions} />
        </ChartCard>
        <ChartCard title="Revenue by Payment Method">
          <Doughnut data={paymentMethodData} options={doughnutOptions} />
        </ChartCard>
        <ChartCard title="Revenue by Location (Top 8)">
          <Bar data={locationRevenueData} options={chartOptions} />
        </ChartCard>
      </div>

      {/* Refund Statistics */}
      {data.refundStatistics && (
        <ChartCard title="Refund Statistics">
          <div className="performance-stats">
            <div className="stat-item"><span className="stat-label">Total Refunds:</span><span className="stat-value">{formatNumber(data.refundStatistics.totalRefunds)}</span></div>
            <div className="stat-item"><span className="stat-label">Total Refund Amount:</span><span className="stat-value">{formatCurrency(data.refundStatistics.totalRefundAmount)}</span></div>
            <div className="stat-item"><span className="stat-label">Refund Rate:</span><span className="stat-value">{formatPercentage(data.refundStatistics.refundRate)}</span></div>
            <div className="stat-item"><span className="stat-label">Failed Payments:</span><span className="stat-value">{formatNumber(data.failedPaymentCount)}</span></div>
          </div>
        </ChartCard>
      )}

      {/* Payment Method Distribution Table */}
      {data.paymentMethodDistribution?.length > 0 && (
        <ChartCard title="Payment Method Breakdown">
          <DataTable columns={paymentColumns} data={data.paymentMethodDistribution} />
        </ChartCard>
      )}

      {/* Revenue by Charger */}
      {data.revenueByCharger?.length > 0 && (
        <ChartCard title="Revenue by Charger (Top 20)">
          <DataTable columns={chargerRevenueColumns} data={data.revenueByCharger} />
        </ChartCard>
      )}

      {/* Revenue by Host */}
      {data.revenueByHost?.length > 0 && (
        <ChartCard title="Revenue by Host (Top 20)">
          <DataTable columns={hostRevenueColumns} data={data.revenueByHost} />
        </ChartCard>
      )}

      {/* Revenue by Location */}
      {data.revenueByLocation?.length > 0 && (
        <ChartCard title="Revenue by Location">
          <DataTable columns={locationColumns} data={data.revenueByLocation} />
        </ChartCard>
      )}
    </div>
  );
};
export default RevenueAnalyticsSection;
