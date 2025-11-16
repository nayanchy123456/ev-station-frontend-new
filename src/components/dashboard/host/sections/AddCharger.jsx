import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../services/api";
import "../../../../css/chargerForm.css";

const BACKEND_URL = "http://localhost:8080";

const AddCharger = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    location: "",
    pricePerKwh: "",
  });
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate files
    const validFiles = [];
    let hasError = false;

    for (const file of files) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setStatusMessage(`❌ File ${file.name} is too large. Max size is 5MB.`);
        hasError = true;
        break;
      }

      // Check file type
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        setStatusMessage(`❌ File ${file.name} is not a valid image format.`);
        hasError = true;
        break;
      }

      validFiles.push(file);
    }

    if (!hasError && validFiles.length > 0) {
      setImages(validFiles);
      setPreviewUrls(validFiles.map((f) => URL.createObjectURL(f)));
      setActiveIndex(0);
      setStatusMessage("");
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    
    setImages(newImages);
    setPreviewUrls(newPreviews);
    
    // Adjust active index if needed
    if (activeIndex >= newPreviews.length && newPreviews.length > 0) {
      setActiveIndex(newPreviews.length - 1);
    }
  };

  const scrollCarousel = (direction) => {
    if (!carouselRef.current) return;
    const imgWidth = 160 + 5;
    const newIndex = direction === "left" ? activeIndex - 1 : activeIndex + 1;
    const maxIndex = previewUrls.length - 1;

    const clampedIndex = Math.max(0, Math.min(maxIndex, newIndex));
    setActiveIndex(clampedIndex);
    carouselRef.current.scrollTo({ left: clampedIndex * imgWidth, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage("");
    setIsLoading(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("brand", formData.brand);
      data.append("location", formData.location);
      data.append("pricePerKwh", formData.pricePerKwh);

      // Append all images
      images.forEach((img) => data.append("images", img));

      const response = await api.post("/chargers", data, {
        headers: { 
          "Content-Type": "multipart/form-data"
        },
      });

      console.log("Charger added:", response.data);
      setStatusMessage("✅ Charger added successfully!");
      
      // Clean up preview URLs
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      
      setTimeout(() => navigate("/host-dashboard/my-chargers"), 1500);
    } catch (err) {
      console.error("Error adding charger:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      setStatusMessage(`❌ Failed to add charger: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-charger-container">
      <h2>Add New Charger</h2>
      {statusMessage && (
        <p className={`status-message ${statusMessage.includes('✅') ? 'success' : 'error'}`}>
          {statusMessage}
        </p>
      )}

      <form className="add-charger-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Charger Name *</label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="e.g., City Center Station"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="brand">Brand *</label>
          <input
            id="brand"
            type="text"
            name="brand"
            placeholder="e.g., Tesla, ChargePoint"
            value={formData.brand}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location *</label>
          <input
            id="location"
            type="text"
            name="location"
            placeholder="Full address"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="pricePerKwh">Price per kWh (Rs) *</label>
          <input
            id="pricePerKwh"
            type="number"
            name="pricePerKwh"
            placeholder="0.35"
            value={formData.pricePerKwh}
            onChange={handleChange}
            step="0.01"
            min="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="images">Images (Optional, max 5MB each)</label>
          <input
            id="images"
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImagesChange}
          />
          <small className="form-hint">
            Supported formats: JPG, PNG, WEBP. Max size: 5MB per image.
          </small>
        </div>

        {/* Image preview carousel */}
        {previewUrls.length > 0 && (
          <div className="carousel-section">
            <h3 className="carousel-label">
              Selected Images ({previewUrls.length})
            </h3>
            <div className="carousel-container">
              <button 
                type="button" 
                className="arrow left" 
                onClick={() => scrollCarousel("left")}
                disabled={activeIndex === 0}
              >
                &lt;
              </button>
              <div className="carousel-wrapper" ref={carouselRef}>
                {previewUrls.map((img, idx) => (
                  <div key={idx} className="carousel-image-wrapper">
                    <img src={img} alt={`Preview ${idx + 1}`} />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => removeImage(idx)}
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button 
                type="button" 
                className="arrow right" 
                onClick={() => scrollCarousel("right")}
                disabled={activeIndex === previewUrls.length - 1}
              >
                &gt;
              </button>
            </div>
            <div className="carousel-dots">
              {previewUrls.map((_, idx) => (
                <span
                  key={idx}
                  className={activeIndex === idx ? "dot active" : "dot"}
                  onClick={() => {
                    setActiveIndex(idx);
                    if (carouselRef.current) {
                      const imgWidth = 160 + 5;
                      carouselRef.current.scrollTo({ 
                        left: idx * imgWidth, 
                        behavior: "smooth" 
                      });
                    }
                  }}
                ></span>
              ))}
            </div>
          </div>
        )}

        <button 
          type="submit" 
          className="submit-btn" 
          disabled={isLoading}
        >
          {isLoading ? "Adding Charger..." : "Add Charger"}
        </button>
      </form>
    </div>
  );
};

export default AddCharger;