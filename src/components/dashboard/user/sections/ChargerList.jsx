import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../../../css/chargerList.css";
import api from "../../../../services/api";
import ChargerMap from "./ChargerMap";

const BACKEND_URL = "http://localhost:8080";

const ChargerList = () => {
  const navigate = useNavigate();
  const [chargers, setChargers] = useState([]);
  const [filters, setFilters] = useState({ brand: "", location: "", minPrice: "", maxPrice: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCharger, setSelectedCharger] = useState(null);
  const carouselRefs = useRef({});
  const [activeIndex, setActiveIndex] = useState({});

  useEffect(() => {
    fetchChargers();
  }, []);

  const fetchChargers = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filters.brand) params.append("brand", filters.brand);
      if (filters.location) params.append("location", filters.location);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);

      const queryString = params.toString();
      const endpoint = queryString ? `/chargers/search?${queryString}` : "/chargers";

      const response = await api.get(endpoint);
      setChargers(response.data);

      const initialIndex = {};
      response.data.forEach(c => initialIndex[c.id] = 0);
      setActiveIndex(initialIndex);

      if (response.data.length === 0) setError("No chargers found matching your criteria.");
    } catch (err) {
      console.error("Error fetching chargers:", err);
      setError("Failed to load chargers. Please try again.");
      setChargers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleSearch = e => {
    e.preventDefault();
    fetchChargers();
  };

  const clearFilters = () => {
    setFilters({ brand: "", location: "", minPrice: "", maxPrice: "" });
    setSelectedCharger(null);
    setTimeout(() => fetchChargers(), 100);
  };

  const scrollCarousel = (chargerId, direction) => {
    const carousel = carouselRefs.current[chargerId];
    const charger = chargers.find(c => c.id === chargerId);
    if (!carousel || !charger || !charger.images) return;

    const imgWidth = 160 + 5;
    const currentIndex = activeIndex[chargerId] || 0;
    const maxIndex = charger.images.length - 1;
    let newIndex = direction === "left" ? Math.max(0, currentIndex - 1) : Math.min(maxIndex, currentIndex + 1);

    carousel.scrollTo({ left: newIndex * imgWidth, behavior: "smooth" });
    setActiveIndex(prev => ({ ...prev, [chargerId]: newIndex }));
  };

  const handleDotClick = (chargerId, idx) => {
    const carousel = carouselRefs.current[chargerId];
    if (!carousel) return;
    const imgWidth = 160 + 5;
    carousel.scrollTo({ left: idx * imgWidth, behavior: "smooth" });
    setActiveIndex(prev => ({ ...prev, [chargerId]: idx }));
  };

  const handleChargerClick = charger => setSelectedCharger(charger);

  const handleViewDetails = (chargerId, e) => {
    if (e) e.stopPropagation();
    navigate(`/user-dashboard/charger/${chargerId}`);
  };

  const getImageUrl = imgPath => {
    if (!imgPath) return "https://via.placeholder.com/160x120?text=No+Image";
    if (imgPath.startsWith("http")) return imgPath;
    return `${BACKEND_URL}${imgPath.startsWith("/") ? "" : "/"}${imgPath}`;
  };

  return (
    <div className="charger-list-container">
      <h2 className="page-title">Available Charging Stations</h2>

      <form className="filter-bar" onSubmit={handleSearch}>
        <div className="filter-input">
          <i className="fas fa-bolt"></i>
          <input type="text" name="brand" placeholder="Brand (e.g., Tesla)" value={filters.brand} onChange={handleChange} />
        </div>
        <div className="filter-input">
          <i className="fas fa-map-marker-alt"></i>
          <input type="text" name="location" placeholder="Location" value={filters.location} onChange={handleChange} />
        </div>
        <div className="filter-input">
          <i className="fas fa-coins"></i>
          <input type="number" name="minPrice" placeholder="Min Price (Rs)" value={filters.minPrice} onChange={handleChange} step="0.01" />
        </div>
        <div className="filter-input">
          <i className="fas fa-wallet"></i>
          <input type="number" name="maxPrice" placeholder="Max Price (Rs)" value={filters.maxPrice} onChange={handleChange} step="0.01" />
        </div>

        <button type="submit" className="search-btn" disabled={loading}>
          <i className="fas fa-search"></i> {loading ? "Searching..." : "Search"}
        </button>
        <button type="button" className="clear-btn" onClick={clearFilters}>
          <i className="fas fa-undo"></i> Reset
        </button>
      </form>

      <div className="charger-dual-view">
        <div className="charger-list">
          {loading && <p className="status-message">🔍 Loading chargers...</p>}
          {error && !loading && <p className="status-message error">{error}</p>}

          {!loading && chargers.length > 0 ? (
            <div className="charger-grid">
              {chargers.map(c => (
                <div
                  className={`charger-card ${selectedCharger?.id === c.id ? 'selected' : ''}`}
                  key={c.id}
                  onClick={() => handleChargerClick(c)}
                >
                  <div className="slider-container">
                    <button className="arrow left" onClick={e => { e.stopPropagation(); scrollCarousel(c.id, "left"); }} disabled={activeIndex[c.id] === 0}>&lt;</button>
                    <div className="carousel-wrapper" ref={el => (carouselRefs.current[c.id] = el)}>
                      {c.images && c.images.length > 0 ? c.images.map((img, idx) => (
                        <img key={idx} src={getImageUrl(img)} alt={`${c.name} - Image ${idx + 1}`} onError={e => e.target.src = "https://via.placeholder.com/160x120?text=Image+Not+Found"} />
                      )) : <img src="https://via.placeholder.com/160x120?text=No+Image" alt="No charger images" />}
                    </div>
                    <button className="arrow right" onClick={e => { e.stopPropagation(); scrollCarousel(c.id, "right"); }} disabled={activeIndex[c.id] === (c.images?.length || 1) - 1}>&gt;</button>
                  </div>

                  {c.images && c.images.length > 1 && (
                    <div className="carousel-dots">
                      {c.images.map((_, idx) => (
                        <span key={idx} className={activeIndex[c.id] === idx ? "dot active" : "dot"} onClick={e => { e.stopPropagation(); handleDotClick(c.id, idx); }}></span>
                      ))}
                    </div>
                  )}

                  <div className="charger-info">
                    <h3>{c.name}</h3>
                    <p><strong>Brand:</strong> {c.brand}</p>
                    <p><strong>Location:</strong> {c.location}</p>
                    <p><strong>Price:</strong> Rs {c.pricePerKwh}/kWh</p>
                    <p><strong>Host:</strong> {c.hostEmail || "N/A"}</p>
                    <p><strong>Rating:</strong> ⭐ {c.rating?.toFixed(1) || "0.0"}</p>
                    <button className="view-details-btn" onClick={e => handleViewDetails(c.id, e)}>View Details</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !loading && (
              <div className="empty-state">
                <p>No chargers available at the moment.</p>
                <button className="clear-btn" onClick={clearFilters}>Show All Chargers</button>
              </div>
            )
          )}
        </div>

        <div className="charger-map">
          <ChargerMap
            chargers={chargers}
            selectedCharger={selectedCharger}
            onMarkerClick={handleChargerClick}
            removeOverlay={true} // Pass prop to remove dark overlay
            showIndicator={true} // Highlight selected charger properly
          />
        </div>
      </div>
    </div>
  );
};

export default ChargerList;
