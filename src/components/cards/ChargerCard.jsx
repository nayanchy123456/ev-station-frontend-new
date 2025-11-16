// src/components/cards/ChargerCard.jsx
import React from "react";
import "../../css/ChargerCard.css";

const ChargerCard = ({ charger }) => {
  return (
    <div className="charger-card">
      <div className="charger-image">
        <img src={charger.images?.[0] || "/placeholder.png"} alt={charger.brand} />
      </div>
      <div className="charger-details">
        <h3>{charger.brand}</h3>
        <p>{charger.location}</p>
        <p>Price: ${charger.pricePerKwh} / kWh</p>
      </div>
    </div>
  );
};

export default ChargerCard;
