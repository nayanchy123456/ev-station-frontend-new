import React, { useState } from "react";
import { Calendar } from "lucide-react";
import { getDateRangePresets } from "../../../../services/adminAnalyticsService";
import "../../../../css/adminAnalytics/dateRangePicker.css";

const DateRangePicker = ({ dateRange, onChange }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [customStart, setCustomStart] = useState(dateRange.startDate);
  const [customEnd, setCustomEnd] = useState(dateRange.endDate);

  const presets = getDateRangePresets();

  const handlePresetSelect = (preset) => {
    onChange(preset);
    setShowDropdown(false);
    setCustomMode(false);
  };

  const handleCustomApply = () => {
    onChange({
      label: "Custom Range",
      startDate: customStart,
      endDate: customEnd,
    });
    setShowDropdown(false);
  };

  const formatDateLabel = (dateRange) => {
    if (dateRange.label === "Custom Range") {
      return `${dateRange.startDate} to ${dateRange.endDate}`;
    }
    return dateRange.label;
  };

  return (
    <div className="date-range-picker">
      <button 
        className="date-range-button"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Calendar size={18} />
        <span>{formatDateLabel(dateRange)}</span>
      </button>

      {showDropdown && (
        <div className="date-range-dropdown">
          {/* Preset Options */}
          <div className="preset-section">
            <h4 className="dropdown-title">Quick Select</h4>
            {Object.values(presets).map((preset) => (
              <button
                key={preset.label}
                className={`preset-option ${dateRange.label === preset.label ? 'active' : ''}`}
                onClick={() => handlePresetSelect(preset)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Range */}
          <div className="custom-section">
            <h4 className="dropdown-title">Custom Range</h4>
            <div className="custom-inputs">
              <div className="input-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  max={customEnd}
                />
              </div>
              <div className="input-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  min={customStart}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            <button 
              className="apply-button"
              onClick={handleCustomApply}
            >
              Apply Custom Range
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
