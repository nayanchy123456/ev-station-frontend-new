import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../services/api";
import "../../../../css/hostChargers.css";

const BACKEND_URL = "http://localhost:8080"; // Backend URL

const HostChargers = () => {
  const [chargers, setChargers] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const navigate = useNavigate();
  const carouselRefs = useRef({});
  const [activeIndex, setActiveIndex] = useState({});

  const fetchChargers = async () => {
    try {
      const res = await api.get("/chargers");
      setChargers(res.data);

      // Initialize carousel indices
      const initialIndex = {};
      res.data.forEach(c => initialIndex[c.id] = 0);
      setActiveIndex(initialIndex);

    } catch (err) {
      console.error(err);
      setStatusMessage("Failed to load chargers.");
    }
  };

  useEffect(() => { fetchChargers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this charger?")) return;
    try {
      await api.delete(`/chargers/${id}`);
      setChargers(chargers.filter((c) => c.id !== id));
      setStatusMessage("Charger deleted successfully.");
    } catch (err) {
      console.error(err);
      setStatusMessage("Failed to delete charger.");
    }
  };

  const handleEdit = (id) => { navigate(`/host-dashboard/edit-charger/${id}`); };

  const scrollCarousel = (chargerId, direction) => {
    const carousel = carouselRefs.current[chargerId];
    if (carousel) {
      const scrollAmount = 160; // width of each image
      carousel.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });

      const imgWidth = 160 + 5;
      const newIndex = Math.round(carousel.scrollLeft / imgWidth) + (direction === "left" ? -1 : 1);
      setActiveIndex(prev => ({
        ...prev,
        [chargerId]: Math.max(0, Math.min((chargers.find(c => c.id === chargerId)?.images?.length || 1) - 1, newIndex))
      }));
    }
  };

  return (
    <div className="host-chargers-container">
      <h2>My Chargers</h2>
      {statusMessage && <p className="status-message">{statusMessage}</p>}
      {chargers.length === 0 ? (
        <p>No chargers found. Add one now!</p>
      ) : (
        <div className="chargers-grid">
          {chargers.map((charger) => (
            <div className="charger-card" key={charger.id}>
              {/* Image carousel */}
              <div className="slider-container">
                <button className="arrow left" onClick={() => scrollCarousel(charger.id, "left")}>&lt;</button>
                <div className="carousel-wrapper" ref={el => (carouselRefs.current[charger.id] = el)}>
                  {charger.images && charger.images.length > 0 ? (
                    charger.images.map((img, idx) => (
                      <img key={idx} src={`${BACKEND_URL}${img}`} alt={`${charger.name} ${idx}`} />
                    ))
                  ) : (
                    <img src="https://via.placeholder.com/150x100?text=No+Image" alt="No Charger"/>
                  )}
                </div>
                <button className="arrow right" onClick={() => scrollCarousel(charger.id, "right")}>&gt;</button>
              </div>

              {charger.images && charger.images.length > 1 && (
                <div className="carousel-dots">
                  {charger.images.map((_, idx) => (
                    <span
                      key={idx}
                      className={activeIndex[charger.id] === idx ? "dot active" : "dot"}
                      onClick={() => {
                        const carousel = carouselRefs.current[charger.id];
                        if (carousel) {
                          const imgWidth = 160 + 5;
                          carousel.scrollTo({ left: idx * imgWidth, behavior: "smooth" });
                          setActiveIndex(prev => ({ ...prev, [charger.id]: idx }));
                        }
                      }}
                    ></span>
                  ))}
                </div>
              )}

              <div className="charger-info">
                <h3>{charger.name}</h3>
                <p><strong>Brand:</strong> {charger.brand}</p>
                <p><strong>Location:</strong> {charger.location}</p>
                <p><strong>Price:</strong> Rs {charger.pricePerKwh}</p>
              </div>
              <div className="charger-actions">
                <button className="edit-btn" onClick={() => handleEdit(charger.id)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(charger.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HostChargers;
