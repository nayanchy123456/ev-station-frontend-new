import { useState, useEffect } from "react";
import { BookOpen, TrendingUp, CheckCircle, XCircle, Clock, Calendar, RotateCcw, Timer } from "lucide-react";
import "../../../../services/charRegistration.js";
import { getAdminBookingAnalytics, formatNumber, formatPercentage } from "../../../../services/adminAnalyticsService";
import MetricCard from "../components/MetricCard";
import ChartCard from "../components/ChartCard";
import DataTable from "../components/DataTable";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { Line, Bar, Doughnut } from "react-chartjs-2";

const BookingAnalyticsSection = ({ startDate, endDate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchBookingAnalytics(); }, [startDate, endDate]);

  const fetchBookingAnalytics = async () => {
    try {
      setLoading(true); setError(null);
      const response = await getAdminBookingAnalytics(startDate, endDate);
      setData(response);
    } catch (err) {
      setError("Failed to load booking analytics. Please try again.");
    } finally { setLoading(false); }
  };

  if (loading) return <LoadingSpinner message="Loading booking analytics..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchBookingAnalytics} />;
  if (!data) return null;

  // Backend: bookingsByStatus[].status, .count, .percentage
  const statusData = {
    labels: data.bookingsByStatus?.map((s) => s.status) || [],
    datasets: [{ data: data.bookingsByStatus?.map((s) => s.count) || [],
      backgroundColor: ["rgba(16,185,129,0.8)","rgba(59,130,246,0.8)","rgba(245,158,11,0.8)",
        "rgba(239,68,68,0.8)","rgba(107,114,128,0.8)"] }],
  };

  // Backend: dailyBookingTrend[].date, .count, .period
  const dailyTrendData = {
    labels: data.dailyBookingTrend?.map((p) => p.date) || [],
    datasets: [{ label: "Daily Bookings", data: data.dailyBookingTrend?.map((p) => p.count) || [],
      borderColor: "rgb(59,130,246)", backgroundColor: "rgba(59,130,246,0.1)", fill: true, tension: 0.4 }],
  };

  // Backend: weeklyBookingComparison[].date, .count, .period
  const weeklyTrendData = {
    labels: data.weeklyBookingComparison?.map((p) => p.date) || [],
    datasets: [{ label: "Weekly Bookings", data: data.weeklyBookingComparison?.map((p) => p.count) || [],
      backgroundColor: "rgba(16,185,129,0.8)" }],
  };

  // Backend: monthlyBookingComparison[].date, .count, .period
  const monthlyTrendData = {
    labels: data.monthlyBookingComparison?.map((p) => p.date) || [],
    datasets: [{ label: "Monthly Bookings", data: data.monthlyBookingComparison?.map((p) => p.count) || [],
      backgroundColor: "rgba(139,92,246,0.8)" }],
  };

  // Backend: peakBookingHours[].hour, .bookingCount
  const peakHoursData = {
    labels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2,"0")}:00`),
    datasets: [{ label: "Bookings", data: Array.from({ length: 24 }, (_, i) => {
        const h = data.peakBookingHours?.find((p) => p.hour === i);
        return h ? h.bookingCount : 0;
      }), backgroundColor: "rgba(245,158,11,0.8)" }],
  };

  // Backend: bookingFrequencyByDay[].dayOfWeek, .count
  const dayFrequencyData = {
    labels: data.bookingFrequencyByDay?.map((d) => d.dayOfWeek) || [],
    datasets: [{ label: "Bookings", data: data.bookingFrequencyByDay?.map((d) => d.count) || [],
      backgroundColor: "rgba(236,72,153,0.8)" }],
  };

  // Backend: popularBookingDurations[].durationRange, .count
  const durationData = {
    labels: data.popularBookingDurations?.map((d) => d.durationRange) || [],
    datasets: [{ data: data.popularBookingDurations?.map((d) => d.count) || [],
      backgroundColor: ["rgba(59,130,246,0.8)","rgba(16,185,129,0.8)","rgba(245,158,11,0.8)","rgba(139,92,246,0.8)","rgba(239,68,68,0.8)"] }],
  };

  // Status table
  const statusColumns = [
    { key: "status", label: "Status", render: (v) => <span className={`status-badge ${v?.toLowerCase()}`}>{v}</span> },
    { key: "count", label: "Count", render: (v) => formatNumber(v) },
    { key: "percentage", label: "Percentage", render: (v) => formatPercentage(v) },
  ];

  const chartOptions = { responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } };
  const doughnutOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } };

  return (
    <div className="booking-analytics-section">
      <div className="metrics-grid">
        {/* Backend: totalBookings */}
        <MetricCard title="Total Bookings" value={formatNumber(data.totalBookings)} icon={BookOpen} color="blue" subtitle="In selected period" />
        {/* Backend: bookingCompletionRate */}
        <MetricCard title="Completion Rate" value={formatPercentage(data.bookingCompletionRate)} icon={CheckCircle} color="green" subtitle="Completed bookings" />
        {/* Backend: cancellationRate */}
        <MetricCard title="Cancellation Rate" value={formatPercentage(data.cancellationRate)} icon={XCircle} color="red" subtitle="Cancelled bookings" />
        {/* Backend: averageBookingDurationHours */}
        <MetricCard title="Avg Duration" value={`${(data.averageBookingDurationHours || 0).toFixed(1)}h`} icon={Clock} color="purple" subtitle="Average booking hours" />
        {/* Backend: averageLeadTimeHours */}
        <MetricCard title="Avg Lead Time" value={`${(data.averageLeadTimeHours || 0).toFixed(1)}h`} icon={Timer} color="amber" subtitle="Advance booking time" />
        {/* Backend: repeatBookingRate */}
        <MetricCard title="Repeat Booking Rate" value={formatPercentage(data.repeatBookingRate)} icon={RotateCcw} color="teal" subtitle="Returning users" />
        {/* Backend: reservationExpiryRate */}
        <MetricCard title="Reservation Expiry Rate" value={formatPercentage(data.reservationExpiryRate)} icon={Calendar} color="rose" subtitle="Expired reservations" />
      </div>

      <div className="charts-grid">
        <ChartCard title="Booking Status Distribution">
          <Doughnut data={statusData} options={doughnutOptions} />
        </ChartCard>
        <ChartCard title="Daily Booking Trend">
          <Line data={dailyTrendData} options={chartOptions} />
        </ChartCard>
        <ChartCard title="Weekly Booking Comparison">
          <Bar data={weeklyTrendData} options={chartOptions} />
        </ChartCard>
        <ChartCard title="Monthly Booking Comparison">
          <Bar data={monthlyTrendData} options={chartOptions} />
        </ChartCard>
        <ChartCard title="Peak Booking Hours (24h)">
          <Bar data={peakHoursData} options={chartOptions} />
        </ChartCard>
        <ChartCard title="Booking Frequency by Day">
          <Bar data={dayFrequencyData} options={chartOptions} />
        </ChartCard>
        <ChartCard title="Popular Booking Durations">
          <Doughnut data={durationData} options={doughnutOptions} />
        </ChartCard>
      </div>

      {/* Booking Behavior stats */}
      <ChartCard title="Booking Behavior Summary">
        <div className="performance-stats">
          <div className="stat-item"><span className="stat-label">Avg Lead Time:</span><span className="stat-value">{(data.averageLeadTimeHours || 0).toFixed(1)}h</span></div>
          <div className="stat-item"><span className="stat-label">Repeat Booking Rate:</span><span className="stat-value">{formatPercentage(data.repeatBookingRate)}</span></div>
          <div className="stat-item"><span className="stat-label">Reservation Expiry Rate:</span><span className="stat-value">{formatPercentage(data.reservationExpiryRate)}</span></div>
          <div className="stat-item"><span className="stat-label">Avg Duration:</span><span className="stat-value">{(data.averageBookingDurationHours || 0).toFixed(1)}h</span></div>
        </div>
      </ChartCard>

      {/* Booking status breakdown table */}
      {data.bookingsByStatus?.length > 0 && (
        <ChartCard title="Status Breakdown">
          <DataTable columns={statusColumns} data={data.bookingsByStatus} />
        </ChartCard>
      )}
    </div>
  );
};
export default BookingAnalyticsSection;
