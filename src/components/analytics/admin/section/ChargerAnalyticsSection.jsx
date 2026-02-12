import { useState, useEffect } from "react";
import { Zap, MapPin, TrendingUp, Activity, BarChart2, DollarSign } from "lucide-react";
import "../../../../services/charRegistration.js";
import { getAdminChargerAnalytics, formatNumber, formatCurrency, formatPercentage } from "../../../../services/adminAnalyticsService";
import MetricCard from "../components/MetricCard";
import ChartCard from "../components/ChartCard";
import DataTable from "../components/DataTable";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { Bar, Doughnut, Pie } from "react-chartjs-2";

const ChargerAnalyticsSection = ({ startDate, endDate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchChargerAnalytics(); }, [startDate, endDate]);

  const fetchChargerAnalytics = async () => {
    try {
      setLoading(true); setError(null);
      const response = await getAdminChargerAnalytics(startDate, endDate);
      setData(response);
    } catch (err) {
      setError("Failed to load charger analytics. Please try again.");
    } finally { setLoading(false); }
  };

  if (loading) return <LoadingSpinner message="Loading charger analytics..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchChargerAnalytics} />;
  if (!data) return null;

  // Backend: chargersByBrand[].brand, .count, .percentage
  const brandDistData = {
    labels: data.chargersByBrand?.map((b) => b.brand) || [],
    datasets: [{ data: data.chargersByBrand?.map((b) => b.count) || [],
      backgroundColor: ["rgba(59,130,246,0.8)","rgba(16,185,129,0.8)","rgba(245,158,11,0.8)",
        "rgba(139,92,246,0.8)","rgba(236,72,153,0.8)","rgba(20,184,166,0.8)"] }],
  };

  // Backend: geographicDistribution[].location, .chargerCount, .bookingCount, .revenue
  const geoData = {
    labels: data.geographicDistribution?.slice(0, 6).map((g) => g.location) || [],
    datasets: [{ data: data.geographicDistribution?.slice(0, 6).map((g) => g.chargerCount) || [],
      backgroundColor: ["rgba(59,130,246,0.8)","rgba(16,185,129,0.8)","rgba(245,158,11,0.8)",
        "rgba(139,92,246,0.8)","rgba(236,72,153,0.8)","rgba(251,146,60,0.8)"] }],
  };

  // Backend: mostBookedChargers[].name, .bookingCount
  const topBookedData = {
    labels: data.mostBookedChargers?.slice(0, 10).map((c) => c.name?.substring(0, 18) + "…") || [],
    datasets: [{ label: "Total Bookings", data: data.mostBookedChargers?.slice(0, 10).map((c) => c.bookingCount) || [],
      backgroundColor: "rgba(59,130,246,0.8)" }],
  };

  // Backend: peakBookingTimes[].hour, .dayOfWeek, .bookingCount
  const peakTimesData = {
    labels: data.peakBookingTimes?.slice(0, 20).map((p) => `${p.dayOfWeek?.substring(0,3)} ${p.hour}:00`) || [],
    datasets: [{ label: "Bookings", data: data.peakBookingTimes?.slice(0, 20).map((p) => p.bookingCount) || [],
      backgroundColor: "rgba(139,92,246,0.8)" }],
  };

  // Top chargers table — Backend: TopCharger fields
  const chargerColumns = [
    { key: "name", label: "Charger Name" },
    { key: "brand", label: "Brand" },
    { key: "location", label: "Location" },
    { key: "hostName", label: "Host" },
    { key: "bookingCount", label: "Bookings", render: (v) => formatNumber(v) },
    { key: "totalRevenue", label: "Revenue", render: (v) => formatCurrency(v) },
    { key: "averageRating", label: "Rating", render: (v) => <span className="rating-badge">⭐ {v?.toFixed(2) || "N/A"}</span> },
    { key: "pricePerKwh", label: "Price/kWh", render: (v) => formatCurrency(v) },
  ];

  // Geographic table
  const geoColumns = [
    { key: "location", label: "Location" },
    { key: "chargerCount", label: "Chargers", render: (v) => formatNumber(v) },
    { key: "bookingCount", label: "Bookings", render: (v) => formatNumber(v) },
    { key: "revenue", label: "Revenue", render: (v) => formatCurrency(v) },
  ];

  const chartOptions = { responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } };
  const pieOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } };

  return (
    <div className="charger-analytics-section">
      <div className="metrics-grid">
        {/* Backend: totalChargersRegistered */}
        <MetricCard title="Total Chargers" value={formatNumber(data.totalChargersRegistered)} icon={Zap} color="blue" subtitle="Registered chargers" />
        {/* Backend: averagePricePerKwh */}
        <MetricCard title="Avg Price / kWh" value={formatCurrency(data.averagePricePerKwh)} icon={DollarSign} color="green" subtitle="Platform average" />
        {/* Backend: averageBookingRatePerCharger */}
        <MetricCard title="Avg Bookings / Charger" value={(data.averageBookingRatePerCharger || 0).toFixed(2)} icon={Activity} color="purple" subtitle="Per charger metric" />
        {/* Backend: totalEnergyConsumedKwh */}
        <MetricCard title="Total Energy Consumed" value={`${(data.totalEnergyConsumedKwh || 0).toFixed(2)} kWh`} icon={TrendingUp} color="amber" subtitle="All-time energy" />
        {/* Backend: chargerAvailabilityRatio */}
        <MetricCard title="Availability Ratio" value={formatPercentage(data.chargerAvailabilityRatio)} icon={BarChart2} color="teal" subtitle="Charger availability" />
        {/* Backend: geographicDistribution.length */}
        <MetricCard title="Total Locations" value={formatNumber(data.geographicDistribution?.length)} icon={MapPin} color="rose" subtitle="Unique locations" />
      </div>

      <div className="charts-grid">
        <ChartCard title="Chargers by Brand">
          <Doughnut data={brandDistData} options={pieOptions} />
        </ChartCard>
        <ChartCard title="Chargers by Location">
          <Pie data={geoData} options={pieOptions} />
        </ChartCard>
        <ChartCard title="Top 10 Most Booked Chargers">
          <Bar data={topBookedData} options={chartOptions} />
        </ChartCard>
        <ChartCard title="Peak Booking Times (Top 20)">
          <Bar data={peakTimesData} options={chartOptions} />
        </ChartCard>
      </div>

      {/* Geographic Distribution Table */}
      {data.geographicDistribution?.length > 0 && (
        <ChartCard title="Geographic Distribution">
          <DataTable columns={geoColumns} data={data.geographicDistribution} />
        </ChartCard>
      )}

      {/* Backend: mostBookedChargers */}
      {data.mostBookedChargers?.length > 0 && (
        <ChartCard title="Most Booked Chargers">
          <DataTable columns={chargerColumns} data={data.mostBookedChargers} />
        </ChartCard>
      )}

      {/* Backend: highestRevenueChargers */}
      {data.highestRevenueChargers?.length > 0 && (
        <ChartCard title="Highest Revenue Chargers">
          <DataTable columns={chargerColumns} data={data.highestRevenueChargers} />
        </ChartCard>
      )}

      {/* Backend: topRatedChargers */}
      {data.topRatedChargers?.length > 0 && (
        <ChartCard title="Top Rated Chargers">
          <DataTable columns={chargerColumns} data={data.topRatedChargers} />
        </ChartCard>
      )}

      {/* Backend: underutilizedChargers */}
      {data.underutilizedChargers?.length > 0 && (
        <ChartCard title="⚠️ Underutilized Chargers">
          <DataTable columns={chargerColumns} data={data.underutilizedChargers} />
        </ChartCard>
      )}
    </div>
  );
};
export default ChargerAnalyticsSection;
