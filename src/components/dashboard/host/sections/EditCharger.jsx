import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../services/api";
import "../../../../css/chargerForm.css";

const BACKEND_URL = "http://localhost:8080";

const EditCharger = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  console.log("🔍 EditCharger component mounted with ID:", id);

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    location: "",
    pricePerKwh: "",
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Start as true
  const [fetchError, setFetchError] = useState(false);
  const [keepExistingImages, setKeepExistingImages] = useState(true);
  const [activeExistingIndex, setActiveExistingIndex] = useState(0);
  const [activeNewIndex, setActiveNewIndex] = useState(0);
  const existingCarouselRef = useRef(null);
  const newCarouselRef = useRef(null);

  // Fetch charger details
  useEffect(() => {
    console.log("🚀 useEffect triggered, fetching charger...");
    
    const fetchCharger = async () => {
      setIsLoading(true);
      setStatusMessage("");
      setFetchError(false);
      
      try {
        console.log("📡 Calling API: /chargers/" + id);
        const res = await api.get(`/chargers/${id}`);
        console.log("✅ API Response received:", res);
        console.log("📦 Response data:", res.data);
        
        const charger = res.data;

        if (!charger) {
          throw new Error("No charger data received");
        }

        console.log("📝 Setting form data:", {
          name: charger.name,
          brand: charger.brand,
          location: charger.location,
          pricePerKwh: charger.pricePerKwh,
        });

        setFormData({
          name: charger.name || "",
          brand: charger.brand || "",
          location: charger.location || "",
          pricePerKwh: charger.pricePerKwh || "",
        });

        // Process existing images
        if (charger.images && charger.images.length > 0) {
          console.log("🖼️ Processing images:", charger.images);
          const fullImageUrls = charger.images.map(img => {
            const imageUrl = img.startsWith("http") ? img : `${BACKEND_URL}${img}`;
            console.log("  Image URL:", imageUrl);
            return imageUrl;
          });
          setExistingImages(fullImageUrls);
        } else {
          console.log("ℹ️ No images found for this charger");
        }

        console.log("✅ Form data set successfully");

      } catch (err) {
        console.error("❌ Error fetching charger:", err);
        console.error("❌ Error details:", {
          message: err.message,
          response: err.response,
          status: err.response?.status,
          data: err.response?.data,
        });
        
        setFetchError(true);
        const errorMsg = err.response?.data?.message 
          || err.response?.data?.error 
          || err.message 
          || "Failed to load charger";
        setStatusMessage(`❌ ${errorMsg}`);
      } finally {
        console.log("🏁 Fetch complete, setting loading to false");
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCharger();
    } else {
      console.error("❌ No ID found in URL params!");
      setIsLoading(false);
      setFetchError(true);
      setStatusMessage("❌ No charger ID provided");
    }
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    console.log(`📝 Form field changed: ${name} = ${value}`);
    setFormData({ ...formData, [name]: value });
  };

  const handleImagesChange = e => {
    const files = Array.from(e.target.files);
    console.log("📸 New images selected:", files.length);
    
    const validFiles = [];
    let hasError = false;

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setStatusMessage(`❌ File ${file.name} is too large. Max size is 5MB.`);
        hasError = true;
        break;
      }

      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        setStatusMessage(`❌ File ${file.name} is not a valid image format.`);
        hasError = true;
        break;
      }

      validFiles.push(file);
    }

    if (!hasError && validFiles.length > 0) {
      setNewImages(validFiles);
      setPreviewUrls(validFiles.map(f => URL.createObjectURL(f)));
      setActiveNewIndex(0);
      setStatusMessage("");
      console.log("✅ Valid images set:", validFiles.length);
    }
  };

  const removeNewImage = (index) => {
    console.log("🗑️ Removing image at index:", index);
    const updated = newImages.filter((_, i) => i !== index);
    const updatedPreviews = previewUrls.filter((_, i) => i !== index);
    
    setNewImages(updated);
    setPreviewUrls(updatedPreviews);
    
    if (activeNewIndex >= updatedPreviews.length && updatedPreviews.length > 0) {
      setActiveNewIndex(updatedPreviews.length - 1);
    }
  };

  const scrollCarousel = (direction, isExisting) => {
    const ref = isExisting ? existingCarouselRef : newCarouselRef;
    const activeIndex = isExisting ? activeExistingIndex : activeNewIndex;
    const setActiveIndex = isExisting ? setActiveExistingIndex : setActiveNewIndex;
    const length = isExisting ? existingImages.length : previewUrls.length;

    if (!ref.current) return;
    const imgWidth = 160 + 5;
    const newIndex = direction === "left" ? activeIndex - 1 : activeIndex + 1;
    const maxIndex = length - 1;

    const clampedIndex = Math.max(0, Math.min(maxIndex, newIndex));
    setActiveIndex(clampedIndex);
    ref.current.scrollTo({ left: clampedIndex * imgWidth, behavior: "smooth" });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    console.log("📤 Submitting update for charger:", id);
    setStatusMessage("");
    setIsLoading(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("brand", formData.brand);
      data.append("location", formData.location);
      data.append("pricePerKwh", parseFloat(formData.pricePerKwh));
      data.append("keepExistingImages", keepExistingImages);

      newImages.forEach(img => data.append("images", img));

      console.log("📡 Sending PUT request to /chargers/" + id);
      const response = await api.put(`/chargers/${id}`, data, {
        headers: { 
          "Content-Type": "multipart/form-data" 
        },
      });

      console.log("✅ Update successful:", response.data);
      setStatusMessage("✅ Charger updated successfully!");
      
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      
      setTimeout(() => {
        console.log("↩️ Navigating back to my-chargers");
        navigate("/host-dashboard/my-chargers");
      }, 1500);
    } catch (err) {
      console.error("❌ Update failed:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      setStatusMessage(`❌ Failed to update charger: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  console.log("🎨 Rendering component. States:", {
    isLoading,
    fetchError,
    hasFormName: !!formData.name,
    statusMessage,
    existingImagesCount: existingImages.length,
  });

  // Loading state
  if (isLoading) {
    console.log("⏳ Showing loading state");
    return (
      <div className="add-charger-container">
        <h2>Edit Charger</h2>
        <p className="status-message">⏳ Loading charger details...</p>
      </div>
    );
  }

  // Error state
  if (fetchError || (!formData.name && statusMessage)) {
    console.log("❌ Showing error state");
    return (
      <div className="add-charger-container">
        <h2>Edit Charger</h2>
        <p className="status-message error">{statusMessage || "Failed to load charger"}</p>
        <button 
          className="submit-btn" 
          onClick={() => navigate("/host-dashboard/my-chargers")}
        >
          ← Back to My Chargers
        </button>
      </div>
    );
  }

  // Main form
  console.log("✅ Rendering main form");
  return (
    <div className="add-charger-container">
      <h2>Edit Charger</h2>
      
      {statusMessage && (
        <p className={`status-message ${statusMessage.includes('✅') ? 'success' : 'error'}`}>
          {statusMessage}
        </p>
      )}

      <div className="add-charger-form">
        <div className="form-group">
          <label htmlFor="name">Charger Name *</label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Name"
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
            placeholder="Brand"
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
            placeholder="Location"
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
            placeholder="Price per kWh"
            value={formData.pricePerKwh}
            onChange={handleChange}
            step="0.01"
            min="0.01"
            required
          />
        </div>

        {/* Existing images carousel */}
        {existingImages.length > 0 && (
          <div className="carousel-section">
            <h3 className="carousel-label">
              Current Images ({existingImages.length})
            </h3>
            <div className="carousel-container">
              <button 
                type="button" 
                className="arrow left" 
                onClick={() => scrollCarousel("left", true)}
                disabled={activeExistingIndex === 0}
              >
                &lt;
              </button>
              <div className="carousel-wrapper" ref={existingCarouselRef}>
                {existingImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Existing ${idx + 1}`}
                    onError={(e) => {
                      console.error("Failed to load image:", img);
                      e.target.src = "https://via.placeholder.com/160x120?text=Image+Not+Found";
                    }}
                  />
                ))}
              </div>
              <button 
                type="button" 
                className="arrow right" 
                onClick={() => scrollCarousel("right", true)}
                disabled={activeExistingIndex === existingImages.length - 1}
              >
                &gt;
              </button>
            </div>
            <div className="carousel-dots">
              {existingImages.map((_, idx) => (
                <span
                  key={idx}
                  className={activeExistingIndex === idx ? "dot active" : "dot"}
                  onClick={() => {
                    setActiveExistingIndex(idx);
                    if (existingCarouselRef.current) {
                      const imgWidth = 160 + 5;
                      existingCarouselRef.current.scrollTo({ 
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

        {/* Image replacement option */}
        {existingImages.length > 0 && (
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={keepExistingImages}
                onChange={(e) => setKeepExistingImages(e.target.checked)}
              />
              <span>Keep existing images when uploading new ones</span>
            </label>
            <small className="form-hint">
              {keepExistingImages 
                ? "New images will be added to existing ones" 
                : "New images will replace all existing images"}
            </small>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="new-images">
            {existingImages.length > 0 ? "Upload New Images (Optional)" : "Upload Images"}
          </label>
          <input 
            id="new-images"
            type="file" 
            multiple 
            accept="image/jpeg,image/jpg,image/png,image/webp" 
            onChange={handleImagesChange} 
          />
          <small className="form-hint">
            Supported formats: JPG, PNG, WEBP. Max size: 5MB per image.
          </small>
        </div>

        {/* New image previews carousel */}
        {previewUrls.length > 0 && (
          <div className="carousel-section">
            <h3 className="carousel-label">
              New Images to Upload ({previewUrls.length})
            </h3>
            <div className="carousel-container">
              <button 
                type="button" 
                className="arrow left" 
                onClick={() => scrollCarousel("left", false)}
                disabled={activeNewIndex === 0}
              >
                &lt;
              </button>
              <div className="carousel-wrapper" ref={newCarouselRef}>
                {previewUrls.map((img, idx) => (
                  <div key={idx} className="carousel-image-wrapper">
                    <img src={img} alt={`Preview ${idx + 1}`} />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => removeNewImage(idx)}
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
                onClick={() => scrollCarousel("right", false)}
                disabled={activeNewIndex === previewUrls.length - 1}
              >
                &gt;
              </button>
            </div>
            <div className="carousel-dots">
              {previewUrls.map((_, idx) => (
                <span
                  key={idx}
                  className={activeNewIndex === idx ? "dot active" : "dot"}
                  onClick={() => {
                    setActiveNewIndex(idx);
                    if (newCarouselRef.current) {
                      const imgWidth = 160 + 5;
                      newCarouselRef.current.scrollTo({ 
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
          onClick={handleSubmit}
          className="submit-btn" 
          disabled={isLoading}
        >
          {isLoading ? "Updating Charger..." : "Update Charger"}
        </button>
      </div>
    </div>
  );
};

export default EditCharger;