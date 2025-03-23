'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Define the Building interface
interface Building {
  id: string;
  name: string;
  address: string;
  rtuCount: number;
  coordinates: [number, number]; // [latitude, longitude]
}

interface MapComponentProps {
  buildings: Building[];
}

const MapComponent = ({ buildings }: MapComponentProps) => {
  // Fix for default marker icons in react-leaflet
  useEffect(() => {
    // This is needed because the default icons reference assets that aren't properly loaded
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    
    L.Icon.Default.mergeOptions({
      iconUrl: '/marker-icon.png',
      iconRetinaUrl: '/marker-icon.png',
      shadowUrl: '/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  }, []);

  // Default center coordinates (Pittsburgh, PA)
  const defaultCenter: [number, number] = [40.4406, -79.9959];
  
  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border">
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        className="w-full h-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {buildings.map(building => (
          <Marker 
            key={building.id} 
            position={building.coordinates}
          >
            <Popup>
              <div>
                <strong>{building.name}</strong><br />
                {building.address}<br />
                RTUs: {building.rtuCount}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
