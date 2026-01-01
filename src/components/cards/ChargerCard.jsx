// src/components/cards/ChargerCard.jsx
import React, { useState } from "react";
import "../../css/ChargerCard.css";
import BookingForm from "../booking/BookingForm";

const ChargerCard = ({ charger }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="charger-card">
      <div className="charger-image">
        <img src={charger.images?.[0] || "/placeholder.png"} alt={charger.brand} />
      </div>
      <div className="charger-details">
        <h3>{charger.brand}</h3>
        <p>{charger.location}</p>
        <p>Price: ${charger.pricePerKwh} / kWh</p>
        <button type="button" onClick={() => { console.log('Open booking modal', charger.id); setOpen(true); }}>Book</button>
      </div>

      {open && (
        <div className="modal-backdrop" style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999}}>
          <div className="modal-content" style={{background:'#fff', padding:20, borderRadius:8, width:'90%', maxWidth:600}}>
            <button className="modal-close" type="button" onClick={() => setOpen(false)} style={{float:'right'}}>Close</button>
            <BookingForm charger={charger} onCreated={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChargerCard;
