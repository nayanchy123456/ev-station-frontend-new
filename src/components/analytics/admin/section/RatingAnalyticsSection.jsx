import { useState, useEffect } from "react";
import { Star, TrendingUp, MessageSquare, BarChart2, Award, ThumbsUp } from "lucide-react";
import "../../../../services/charRegistration.js";
import { getAdminRatingAnalytics, formatNumber, formatPercentage } from "../../../../services/adminAnalyticsService";
import MetricCard from "../components/MetricCard";
import ChartCard from "../components/ChartCard";
import DataTable from "../components/DataTable";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { Line, Bar, Doughnut } from "react-chartjs-2";

const RatingAnalyticsSection = ({ startDate, endDate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchRatingAnalytics(); }, [startDate, endDate]);

  const fetchRatingAnalytics = async () => {
    try {
      setLoading(true); setError(null);
      const response = await getAdminRatingAnalytics(startDate, endDate);
      setData(response);
    } catch (err) {
      setError("Failed to load rating analytics. Please try again.");
    } finally { setLoading(false); }
  };

  if (loading) return <LoadingSpinner message="Loading rating analytics..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchRatingAnalytics} />;
  if (!data) return null;

  // Backend: ratingDistribution[].stars, .count, .percentage
  const ratingDistData = {
    labels: (data.ratingDistribution || []).map((r) => `${r.stars} Star${r.stars > 1 ? "s" : ""}`),
    datasets: [{ label: "Count", data: (data.ratingDistribution || []).map((r) => r.count),
      backgroundColor: ["rgba(16,185,129,0.8)","rgba(59,130,246,0.8)","rgba(245,158,11,0.8)",
        "rgba(251,146,60,0.8)","rgba(239,68,68,0.8)"] }],
  };

  // Sentiment from ratingDistribution
  const fiveStar = data.ratingDistribution?.find((r) => r.stars === 5)?.count || 0;
  const fourStar = data.ratingDistribution?.find((r) => r.stars === 4)?.count || 0;
  const threeStar = data.ratingDistribution?.find((r) => r.stars === 3)?.count || 0;
  const twoStar = data.ratingDistribution?.find((r) => r.stars === 2)?.count || 0;
  const oneStar = data.ratingDistribution?.find((r) => r.stars === 1)?.count || 0;

  const sentimentData = {
    labels: ["Positive (4-5★)", "Neutral (3★)", "Negative (1-2★)"],
    datasets: [{ data: [fiveStar + fourStar, threeStar, twoStar + oneStar],
      backgroundColor: ["rgba(16,185,129,0.8)","rgba(245,158,11,0.8)","rgba(239,68,68,0.8)"] }],
  };

  // Backend: averageRatingTrend[].date, .averageRating, .ratingCount
  const trendData = {
    labels: data.averageRatingTrend?.map((p) => p.date) || [],
    datasets: [{ label: "Avg Rating", data: data.averageRatingTrend?.map((p) => p.averageRating) || [],
      borderColor: "rgb(245,158,11)", backgroundColor: "rgba(245,158,11,0.1)", fill: true, tension: 0.4 }],
  };

  // Backend: ratingDistributionByBrand[].brand, .averageRating, .ratingCount
  const brandRatingData = {
    labels: data.ratingDistributionByBrand?.map((b) => b.brand) || [],
    datasets: [{ label: "Avg Rating", data: data.ratingDistributionByBrand?.map((b) => b.averageRating) || [],
      backgroundColor: "rgba(59,130,246,0.8)" }],
  };

  // Backend: TopRatedCharger fields: chargerId, chargerName, brand, location, averageRating, ratingCount, hostName
  const chargerRatingColumns = [
    { key: "chargerName", label: "Charger" },
    { key: "brand", label: "Brand" },
    { key: "location", label: "Location" },
    { key: "hostName", label: "Host" },
    { key: "averageRating", label: "Rating", render: (v) => <span className="rating-badge">⭐ {v?.toFixed(2) || "N/A"}</span> },
    { key: "ratingCount", label: "Total Ratings", render: (v) => formatNumber(v) },
  ];

  // Backend: usersWhoRateMostFrequently[].userId, .userName, .ratingCount, .averageRatingGiven
  const frequentRaterColumns = [
    { key: "userName", label: "User" },
    { key: "ratingCount", label: "Ratings Given", render: (v) => formatNumber(v) },
    { key: "averageRatingGiven", label: "Avg Given", render: (v) => v?.toFixed(2) || "N/A" },
  ];

  // Backend: mostRecentReviews[].ratingId, .userName, .chargerName, .ratingScore, .comment, .createdAt
  const recentReviewColumns = [
    { key: "ratingScore", label: "Rating", render: (v) => "⭐".repeat(v || 0) },
    { key: "userName", label: "User" },
    { key: "chargerName", label: "Charger" },
    { key: "comment", label: "Comment", render: (v) => <span className="review-comment">{v ? v.substring(0, 60) + (v.length > 60 ? "…" : "") : "—"}</span> },
    { key: "createdAt", label: "Date", render: (v) => v ? new Date(v).toLocaleDateString() : "N/A" },
  ];

  const chartOptions = { responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 5 } } };
  const barChartOptions = { responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } };
  const doughnutOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } };

  return (
    <div className="rating-analytics-section">
      <div className="metrics-grid">
        {/* Backend: overallPlatformRating */}
        <MetricCard title="Overall Platform Rating" value={(data.overallPlatformRating || 0).toFixed(2)} icon={Star} color="amber" subtitle="All chargers average" />
        {/* Backend: totalRatingsSubmitted */}
        <MetricCard title="Total Ratings Submitted" value={formatNumber(data.totalRatingsSubmitted)} icon={BarChart2} color="blue" subtitle="In selected period" />
        {/* Backend: ratingDistribution stars=5 */}
        <MetricCard title="5-Star Ratings" value={formatNumber(fiveStar)} icon={Award} color="green" subtitle={formatPercentage((fiveStar / (data.totalRatingsSubmitted || 1)) * 100)} />
        {/* Backend: totalReviewsWithComments */}
        <MetricCard title="Reviews with Comments" value={formatNumber(data.totalReviewsWithComments)} icon={MessageSquare} color="purple" subtitle="Written reviews" />
        {/* Positive % derived from ratingDistribution */}
        <MetricCard title="Positive Ratings" value={formatPercentage(((fiveStar + fourStar) / (data.totalRatingsSubmitted || 1)) * 100)} icon={ThumbsUp} color="teal" subtitle="4-5 star ratings" />
        {/* Backend: ratingDistributionByBrand count */}
        <MetricCard title="Rated Brands" value={formatNumber(data.ratingDistributionByBrand?.length)} icon={TrendingUp} color="rose" subtitle="Unique brands rated" />
      </div>

      <div className="charts-grid">
        <ChartCard title="Rating Distribution (1-5 Stars)">
          <Bar data={ratingDistData} options={barChartOptions} />
        </ChartCard>
        <ChartCard title="Rating Sentiment">
          <Doughnut data={sentimentData} options={doughnutOptions} />
        </ChartCard>
        <ChartCard title="Average Rating Trend">
          <Line data={trendData} options={chartOptions} />
        </ChartCard>
        <ChartCard title="Average Rating by Brand">
          <Bar data={brandRatingData} options={chartOptions} />
        </ChartCard>
      </div>

      {/* Rating Distribution Breakdown */}
      {data.ratingDistribution?.length > 0 && (
        <ChartCard title="Rating Distribution Detail">
          <div className="performance-stats">
            {data.ratingDistribution.map((r) => (
              <div key={r.stars} className="stat-item">
                <span className="stat-label">{"⭐".repeat(r.stars)} ({r.stars} Star{r.stars > 1 ? "s" : ""}):</span>
                <span className="stat-value">{formatNumber(r.count)} — {formatPercentage(r.percentage)}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      )}

      {/* Top Rated Chargers */}
      {data.topRatedChargers?.length > 0 && (
        <ChartCard title="Top Rated Chargers">
          <DataTable columns={chargerRatingColumns} data={data.topRatedChargers} />
        </ChartCard>
      )}

      {/* Lowest Rated Chargers */}
      {data.lowestRatedChargers?.length > 0 && (
        <ChartCard title="⚠️ Lowest Rated Chargers (Needs Attention)">
          <DataTable columns={chargerRatingColumns} data={data.lowestRatedChargers} />
        </ChartCard>
      )}

      {/* Frequent Raters */}
      {data.usersWhoRateMostFrequently?.length > 0 && (
        <ChartCard title="Most Frequent Raters">
          <DataTable columns={frequentRaterColumns} data={data.usersWhoRateMostFrequently} />
        </ChartCard>
      )}

      {/* Most Recent Reviews */}
      {data.mostRecentReviews?.length > 0 && (
        <ChartCard title="Most Recent Reviews">
          <DataTable columns={recentReviewColumns} data={data.mostRecentReviews} />
        </ChartCard>
      )}
    </div>
  );
};
export default RatingAnalyticsSection;
