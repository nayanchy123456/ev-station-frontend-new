import { useState, useEffect } from "react";
import { Clock, Calendar, Sun, Moon, TrendingUp, Activity } from "lucide-react";
import "../../../../services/charRegistration.js";
import { getAdminTimeAnalytics, formatNumber, formatPercentage, formatCurrency } from "../../../../services/adminAnalyticsService";
import MetricCard from "../components/MetricCard";
import ChartCard from "../components/ChartCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { Bar, Doughnut } from "react-chartjs-2";

const TimeAnalyticsSection = ({ startDate, endDate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchTimeAnalytics(); }, [startDate, endDate]);

  const fetchTimeAnalytics = async () => {
    try {
      setLoading(true); setError(null);
      const response = await getAdminTimeAnalytics(startDate, endDate);
      setData(response);
    } catch (err) {
      setError("Failed to load time analytics. Please try again.");
    } finally { setLoading(false); }
  };

  if (loading) return <LoadingSpinner message="Loading time analytics..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchTimeAnalytics} />;
  if (!data) return null;

  // Backend: busiestDaysOfWeek[].dayOfWeek, .bookingCount, .averageUtilization
  const dayPatternData = {
    labels: data.busiestDaysOfWeek?.map((d) => d.dayOfWeek) || [],
    datasets: [{ label: "Booking Count",
      data: data.busiestDaysOfWeek?.map((d) => d.bookingCount) || [],
      backgroundColor: ["rgba(59,130,246,0.8)","rgba(16,185,129,0.8)","rgba(245,158,11,0.8)",
        "rgba(139,92,246,0.8)","rgba(236,72,153,0.8)","rgba(251,146,60,0.8)","rgba(239,68,68,0.8)"] }],
  };

  // Backend: peakBookingHours[].hour, .bookingCount, .timeLabel
  const hourPatternData = {
    labels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`),
    datasets: [{ label: "Bookings by Hour",
      data: Array.from({ length: 24 }, (_, i) => {
        const h = data.peakBookingHours?.find((p) => p.hour === i);
        return h ? h.bookingCount : 0;
      }),
      backgroundColor: "rgba(59,130,246,0.8)" }],
  };

  // Backend: seasonalTrends[].period, .bookingCount, .averageRating
  const seasonalBookingsData = {
    labels: data.seasonalTrends?.map((s) => s.period) || [],
    datasets: [
      { label: "Bookings", data: data.seasonalTrends?.map((s) => s.bookingCount) || [], backgroundColor: "rgba(59,130,246,0.8)" },
      { label: "Avg Rating (×20)", data: data.seasonalTrends?.map((s) => (s.averageRating || 0) * 20) || [], backgroundColor: "rgba(245,158,11,0.8)" },
    ],
  };

  // Backend: weekendVsWeekdayPerformance.weekdayBookings, .weekendBookings, .weekdayRevenue, .weekendRevenue
  const wvwBookingsData = {
    labels: ["Weekday", "Weekend"],
    datasets: [{ data: [
        data.weekendVsWeekdayPerformance?.weekdayBookings || 0,
        data.weekendVsWeekdayPerformance?.weekendBookings || 0,
      ],
      backgroundColor: ["rgba(59,130,246,0.8)", "rgba(16,185,129,0.8)"] }],
  };

  const wvwRevenueData = {
    labels: ["Weekday Revenue", "Weekend Revenue"],
    datasets: [{ data: [
        data.weekendVsWeekdayPerformance?.weekdayRevenue || 0,
        data.weekendVsWeekdayPerformance?.weekendRevenue || 0,
      ],
      backgroundColor: ["rgba(59,130,246,0.8)", "rgba(16,185,129,0.8)"] }],
  };

  const chartOptions = { responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } };
  const multiBarOptions = { responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: true, position: "top" } }, scales: { y: { beginAtZero: true } } };
  const doughnutOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } };

  // Derived stats
  const busiestDay = data.busiestDaysOfWeek?.reduce((m, d) => d.bookingCount > (m?.bookingCount || 0) ? d : m, null);
  const busiestHour = data.peakBookingHours?.reduce((m, h) => h.bookingCount > (m?.bookingCount || 0) ? h : m, null);
  const busiestSeason = data.seasonalTrends?.reduce((m, s) => s.bookingCount > (m?.bookingCount || 0) ? s : m, null);
  const wvw = data.weekendVsWeekdayPerformance;
  const totalWvw = (wvw?.weekendBookings || 0) + (wvw?.weekdayBookings || 0);

  return (
    <div className="time-analytics-section">
      <div className="metrics-grid">
        {/* Backend: busiestDaysOfWeek */}
        <MetricCard title="Busiest Day" value={busiestDay?.dayOfWeek || "N/A"} icon={Calendar} color="blue"
          subtitle={`${formatNumber(busiestDay?.bookingCount)} bookings`} />
        {/* Backend: peakBookingHours */}
        <MetricCard title="Peak Hour" value={busiestHour ? `${busiestHour.hour}:00` : "N/A"} icon={Clock} color="purple"
          subtitle={`${formatNumber(busiestHour?.bookingCount)} bookings`} />
        {/* Backend: seasonalTrends */}
        <MetricCard title="Busiest Season" value={busiestSeason?.period || "N/A"} icon={Sun} color="amber"
          subtitle={`${formatNumber(busiestSeason?.bookingCount)} bookings`} />
        {/* Backend: weekendVsWeekdayPerformance.weekendBookings */}
        <MetricCard title="Weekend Bookings" value={formatNumber(wvw?.weekendBookings)} icon={Activity} color="green"
          subtitle={totalWvw > 0 ? formatPercentage((wvw.weekendBookings / totalWvw) * 100) : "0%"} />
        {/* Backend: weekendVsWeekdayPerformance.weekdayBookings */}
        <MetricCard title="Weekday Bookings" value={formatNumber(wvw?.weekdayBookings)} icon={Moon} color="teal"
          subtitle={totalWvw > 0 ? formatPercentage((wvw.weekdayBookings / totalWvw) * 100) : "0%"} />
        {/* Backend: weekendVsWeekdayPerformance.weekendRevenue */}
        <MetricCard title="Weekend Revenue" value={formatCurrency(wvw?.weekendRevenue)} icon={TrendingUp} color="rose"
          subtitle="Weekend earnings" />
      </div>

      <div className="charts-grid">
        <ChartCard title="Bookings by Day of Week">
          <Bar data={dayPatternData} options={chartOptions} />
        </ChartCard>
        <ChartCard title="24-Hour Booking Pattern">
          <Bar data={hourPatternData} options={chartOptions} />
        </ChartCard>
        <ChartCard title="Seasonal Trends">
          <Bar data={seasonalBookingsData} options={multiBarOptions} />
        </ChartCard>
        <ChartCard title="Weekend vs Weekday Bookings">
          <Doughnut data={wvwBookingsData} options={doughnutOptions} />
        </ChartCard>
        <ChartCard title="Weekend vs Weekday Revenue">
          <Doughnut data={wvwRevenueData} options={doughnutOptions} />
        </ChartCard>
      </div>

      {/* Day of Week detailed — Backend: busiestDaysOfWeek */}
      {data.busiestDaysOfWeek?.length > 0 && (
        <ChartCard title="Day of Week Analysis">
          <div className="day-analysis-grid">
            {data.busiestDaysOfWeek.map((day, i) => (
              <div key={i} className="day-card">
                <div className="day-name">{day.dayOfWeek}</div>
                <div className="day-bookings">{formatNumber(day.bookingCount)} bookings</div>
                <div className="day-utilization">
                  <div className="utilization-bar">
                    <div className="utilization-fill"
                      style={{ width: `${Math.min(day.averageUtilization || 0, 100)}%`,
                        backgroundColor: `rgba(59,130,246,${0.4 + ((day.averageUtilization || 0) / 140)})` }} />
                  </div>
                  <span className="utilization-text">{formatPercentage(day.averageUtilization)}</span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      )}

      {/* Peak hours heatmap — Backend: peakBookingHours */}
      {data.peakBookingHours?.length > 0 && (
        <ChartCard title="Hourly Booking Heatmap">
          <div className="hour-heatmap">
            {Array.from({ length: 24 }, (_, hour) => {
              const hData = data.peakBookingHours.find((h) => h.hour === hour);
              const count = hData?.bookingCount || 0;
              const maxCount = Math.max(...data.peakBookingHours.map((h) => h.bookingCount), 1);
              const intensity = (count / maxCount) * 100;
              return (
                <div key={hour} className="hour-cell"
                  style={{ backgroundColor: `rgba(59,130,246,${0.1 + (intensity / 100) * 0.85})` }}>
                  <div className="hour-label">{String(hour).padStart(2, "0")}:00</div>
                  <div className="hour-count">{count}</div>
                </div>
              );
            })}
          </div>
          <div className="heatmap-legend">
            <span className="legend-label">Less Active</span>
            <div className="legend-gradient" />
            <span className="legend-label">More Active</span>
          </div>
        </ChartCard>
      )}

      {/* Weekend vs Weekday detailed — Backend: weekendVsWeekdayPerformance */}
      {wvw && (
        <ChartCard title="Weekend vs Weekday Performance">
          <div className="comparison-grid">
            <div className="comparison-section">
              <h4 className="comparison-title">Weekday Performance</h4>
              <div className="comparison-stats">
                <div className="comparison-stat"><span className="stat-label">Total Bookings:</span><span className="stat-value">{formatNumber(wvw.weekdayBookings)}</span></div>
                <div className="comparison-stat"><span className="stat-label">Total Revenue:</span><span className="stat-value">{formatCurrency(wvw.weekdayRevenue)}</span></div>
                <div className="comparison-stat"><span className="stat-label">Avg Rev/Booking:</span><span className="stat-value">{formatCurrency(wvw.weekdayBookings > 0 ? wvw.weekdayRevenue / wvw.weekdayBookings : 0)}</span></div>
              </div>
            </div>
            <div className="comparison-divider" />
            <div className="comparison-section">
              <h4 className="comparison-title">Weekend Performance</h4>
              <div className="comparison-stats">
                <div className="comparison-stat"><span className="stat-label">Total Bookings:</span><span className="stat-value">{formatNumber(wvw.weekendBookings)}</span></div>
                <div className="comparison-stat"><span className="stat-label">Total Revenue:</span><span className="stat-value">{formatCurrency(wvw.weekendRevenue)}</span></div>
                <div className="comparison-stat"><span className="stat-label">Avg Rev/Booking:</span><span className="stat-value">{formatCurrency(wvw.weekendBookings > 0 ? wvw.weekendRevenue / wvw.weekendBookings : 0)}</span></div>
              </div>
            </div>
          </div>
        </ChartCard>
      )}

      {/* Seasonal insights — Backend: seasonalTrends */}
      {data.seasonalTrends?.length > 0 && (
        <ChartCard title="Seasonal Insights">
          <div className="seasonal-grid">
            {data.seasonalTrends.map((season, i) => (
              <div key={i} className="seasonal-card">
                <div className="seasonal-icon">
                  {season.period === "Spring" && "🌸"}
                  {season.period === "Summer" && "☀️"}
                  {season.period === "Fall" && "🍂"}
                  {season.period === "Winter" && "❄️"}
                </div>
                <div className="seasonal-name">{season.period}</div>
                <div className="seasonal-bookings">{formatNumber(season.bookingCount)} bookings</div>
                <div className="seasonal-rating">⭐ {season.averageRating?.toFixed(2) || "N/A"}</div>
              </div>
            ))}
          </div>
        </ChartCard>
      )}
    </div>
  );
};
export default TimeAnalyticsSection;
