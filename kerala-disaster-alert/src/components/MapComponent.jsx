import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapComponent = ({ predictions, boundaries }) => {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    if (boundaries && boundaries.features) {
        setGeoData(boundaries);
    } else {
        console.error("Invalid boundaries format:", boundaries);
    }
}, [boundaries]);

const style = (districtName) => {
  const prediction = predictions[districtName] || {};
  if (prediction.risk === "High Risk") {
    return {
      fillColor: "red",
      color: "black", // Boundary color
      weight: 1, // Boundary thickness
      fillOpacity: 0.5, // Highlight opacity
    };
  }
  
  // Return no style for non-"High Risk" regions
  return {
    fillColor: "transparent",
    color: "transparent",
    weight: 0,
    fillOpacity: 0,
  };
};



  if (!geoData || !geoData.features) {
    return <p>Loading map data...</p>;
  }

  return (
    <MapContainer
      center={[10.8505, 76.2711]}
      zoom={7}
      style={{ height: "600px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {geoData.features.map((feature, idx) => {
          const districtName = feature.properties.name;
          if (!predictions[districtName]) {
              console.warn(`No prediction for district: ${districtName}`);
          }
          return (
              <GeoJSON
                  key={idx}
                  data={feature}
                  style={() => style(districtName)}
              />
          );
      })}

    </MapContainer>
  );
};

export default MapComponent;
