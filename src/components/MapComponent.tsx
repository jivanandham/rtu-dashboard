'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
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
  isSatelliteView?: boolean;
  setIsSatelliteView?: (value: boolean) => void;
}

// Map Controls Component
function MapControls({ map }: { map: L.Map }) {
  return (
    <div className="absolute top-4 left-4 z-[1000] bg-white rounded-md shadow-md p-2 flex flex-col gap-2">
      <button 
        className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow hover:bg-gray-100"
        onClick={() => map.zoomIn()}
      >
        <span className="text-xl">+</span>
      </button>
      <button 
        className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow hover:bg-gray-100"
        onClick={() => map.zoomOut()}
      >
        <span className="text-xl">−</span>
      </button>
    </div>
  );
}

// Map Type Selector Component
function MapTypeSelector({ isSatellite, setIsSatellite }: { isSatellite: boolean, setIsSatellite: (value: boolean) => void }) {
  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white rounded-md shadow-md">
      <button 
        className={`px-3 py-1 text-sm ${isSatellite ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
        onClick={() => setIsSatellite(true)}
      >
        Satellite
      </button>
      <button 
        className={`px-3 py-1 text-sm ${!isSatellite ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
        onClick={() => setIsSatellite(false)}
      >
        Map
      </button>
    </div>
  );
}

// Component to get map instance
function MapController({ setMap }: { setMap: (map: L.Map) => void }) {
  const map = useMap();
  
  useEffect(() => {
    setMap(map);
  }, [map, setMap]);
  
  return null;
}

const MapComponent = ({ buildings, isSatelliteView = false, setIsSatelliteView }: MapComponentProps) => {
  const [activeBuilding, setActiveBuilding] = useState<Building | null>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [localSatelliteView, setLocalSatelliteView] = useState(isSatelliteView);

  // Handle satellite view changes
  const handleSatelliteToggle = (value: boolean) => {
    setLocalSatelliteView(value);
    if (setIsSatelliteView) {
      setIsSatelliteView(value);
    }
  };

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

  // Custom marker icons
  const defaultIcon = new L.Icon({
    iconUrl: '/marker-icon.png',
    shadowUrl: '/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Default center coordinates (Pittsburgh, PA)
  const defaultCenter: [number, number] = [40.4406, -79.9959];
  
  return (
    <div className="relative h-full w-full">
      {/* Main Map */}
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        className="w-full h-full"
        scrollWheelZoom={true}
        zoomControl={false} // Disable default zoom control
        style={{ background: '#f8f9fa' }} // Google Maps-like background color
      >
        {/* Map Controller to get map instance */}
        <MapController setMap={setMap} />
        
        {/* Tile Layer - Satellite or Standard */}
        {localSatelliteView ? (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
          />
        ) : (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
        )}
        
        {/* Building Markers */}
        {buildings.map(building => (
          <Marker 
            key={building.id} 
            position={building.coordinates}
            icon={defaultIcon}
            eventHandlers={{
              click: () => {
                setActiveBuilding(building);
              }
            }}
          >
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-base">{building.name}</h3>
                <p className="text-sm text-gray-600">{building.address}</p>
                <p className="text-sm mt-1">RTUs: <span className="font-semibold">{building.rtuCount}</span></p>
                <div className="mt-2 flex gap-2">
                  <button className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Details</button>
                  <button className="text-xs bg-gray-200 px-2 py-1 rounded">Directions</button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Controls - Only show if map is loaded */}
      {map && <MapControls map={map} />}

      {/* Map Type Selector */}
      <MapTypeSelector 
        isSatellite={localSatelliteView} 
        setIsSatellite={handleSatelliteToggle} 
      />

      {/* Building Info Card (Google Maps-like) */}
      {activeBuilding && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <button 
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            onClick={() => setActiveBuilding(null)}
          >
            ×
          </button>
          <h3 className="font-bold text-lg">{activeBuilding.name}</h3>
          <p className="text-gray-600 text-sm">{activeBuilding.address}</p>
          <div className="mt-2 pt-2 border-t">
            <p className="font-medium">RTUs Detected: {activeBuilding.rtuCount}</p>
          </div>
          <div className="mt-3 flex gap-2">
            <button className="flex-1 bg-blue-500 text-white py-2 rounded text-sm font-medium">View Details</button>
            <button className="flex-1 bg-gray-100 py-2 rounded text-sm font-medium">Get Directions</button>
          </div>
        </div>
      )}

      {/* Street View Control (Google Maps-like) */}
      <div className="absolute bottom-4 right-4 z-[1000]">
        <button className="bg-white rounded-full shadow-md p-2 hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="4"></circle>
            <line x1="21.17" y1="8" x2="12" y2="8"></line>
            <line x1="3.95" y1="6.06" x2="8.54" y2="14"></line>
            <line x1="10.88" y1="21.94" x2="15.46" y2="14"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MapComponent;
