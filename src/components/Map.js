import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { FiMapPin } from 'react-icons/fi';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function MapComponent() {
  const [position, setPosition] = useState(null); 
  const [error, setError] = useState('');
  const [permissionAsked, setPermissionAsked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAllow = () => {
    setPermissionAsked(true);
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
          setLoading(false);
          setError('');
        },
        (err) => {
          console.warn("Erreur de géolocalisation: ", err.code, err.message);
          let errorMsg = "Impossible d'accéder à votre position.";
          if (err.code === 1) errorMsg = "Vous avez bloqué l'accès au GPS dans le navigateur.";
          if (err.code === 2) errorMsg = "La position est introuvable (réseau ou GPS indisponible).";
          if (err.code === 3) errorMsg = "Le délai d'attente pour trouver la position a expiré.";
          setError(errorMsg + " Veuillez vérifier les paramètres de votre navigateur.");
          setLoading(false);
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      setError("La géolocalisation n'est pas supportée par ce navigateur.");
      setLoading(false);
    }
  };

  const handleDeny = () => {
    setPermissionAsked(true);
    setError("Vous avez refusé l'accès au GPS.");
  };

  if (!permissionAsked) {
    return (
      <div className="gps-dialog-container">
        <div className="gps-dialog-illustration">
          <div className="gps-dialog-shapes">
            <div className="gps-shape-circle-light"></div>
            <div className="gps-shape-square-rotate"></div>
            <div className="gps-shape-circle-light"></div>
            <div className="gps-shape-rect"></div>
            <div className="gps-shape-circle-green"></div>
          </div>
        </div>

        <div>
          <h3 className="gps-dialog-title">
             <FiMapPin className="gps-dialog-icon" /> Activer GPS ?
          </h3>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p className="gps-dialog-text">
            Pour afficher correctement la carte et les opportunités autour de vous, nous avons besoin d'accéder à votre position actuelle.
          </p>
        </div>

        <div className="gps-dialog-actions">
          <button onClick={handleDeny} className="gps-btn-deny">
            Don't allow
          </button>
          <button onClick={handleAllow} className="gps-btn-allow">
            Allow
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gps-error-container">
        ⚠️ {error}
      </div>
    );
  }

  if (loading || !position) {
    return (
      <div className="gps-loading-container">
        <div className="gps-loading-content">
          <div className="gps-spinner"></div>
          <span>Recherche de votre position GPS...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <MapContainer 
        center={position} 
        zoom={14} 
        className="gps-map-wrapper"
      >
        <MapUpdater center={position} />
        
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <Marker position={position}>
          <Popup>
            📍 Votre position actuelle
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
