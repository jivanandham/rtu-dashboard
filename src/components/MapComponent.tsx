'use client';

import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

// Define the Building interface
interface Building {
  id: string;
  name: string;
  address: string;
  rtuCount: number;
  coordinates: [number, number]; // [latitude, longitude]
  type: string;
}

interface MapComponentProps {
  buildings: Building[];
  isSatelliteView?: boolean;
  setIsSatelliteView?: (value: boolean) => void;
}

// Map Controls Component
function MapControls({ map }: { map: google.maps.Map | null }) {
  if (!map) return null;
  
  return (
    <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-2">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <button 
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors border-b border-gray-100"
          onClick={() => map.setZoom((map.getZoom() || 13) + 1)}
          aria-label="Zoom in"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button 
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
          onClick={() => map.setZoom((map.getZoom() || 13) - 1)}
          aria-label="Zoom out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
      
      {/* Street View Button */}
      <button 
        className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        onClick={() => {
          const panorama = map.getStreetView();
          if (panorama.getVisible()) {
            panorama.setVisible(false);
          } else {
            const position = map.getCenter();
            if (position) {
              panorama.setPosition(position);
              panorama.setVisible(true);
            }
          }
        }}
        aria-label="Street View"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </button>
    </div>
  );
}

// Map Type Selector Component
function MapTypeSelector({ isSatellite, setIsSatellite }: { isSatellite: boolean, setIsSatellite: (value: boolean) => void }) {
  return (
    <div className="absolute top-6 right-6 z-[1000] bg-white rounded-lg shadow-lg overflow-hidden">
      <button 
        className={`px-4 py-2 text-sm font-medium transition-colors ${isSatellite ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'}`}
        onClick={() => setIsSatellite(true)}
      >
        Satellite
      </button>
      <button 
        className={`px-4 py-2 text-sm font-medium transition-colors ${!isSatellite ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'}`}
        onClick={() => setIsSatellite(false)}
      >
        Map
      </button>
    </div>
  );
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

// Default center coordinates (Pittsburgh, PA)
const defaultCenter = {
  lat: 40.4406,
  lng: -79.9959
};

const MapComponent = ({ buildings, isSatelliteView = false, setIsSatelliteView }: MapComponentProps) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeBuilding, setActiveBuilding] = useState<Building | null>(null);
  const [localSatelliteView, setLocalSatelliteView] = useState(isSatelliteView);

  // Handle satellite view changes
  const handleSatelliteToggle = (value: boolean) => {
    setLocalSatelliteView(value);
    if (setIsSatelliteView) {
      setIsSatelliteView(value);
    }
    
    if (map) {
      map.setMapTypeId(value ? 'satellite' : 'roadmap');
    }
  };

  const onLoad = useCallback((map: google.maps.Map) => {
    // Enable 45° imagery if available
    if (localSatelliteView) {
      map.setMapTypeId('satellite');
      
      // Enable 3D buildings and terrain
      const mapOptions = {
        tilt: 45, // 45-degree angle view
      };
      map.setOptions(mapOptions);
    }
    
    setMap(map);
  }, [localSatelliteView]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (!isLoaded) {
    return (
      <div className="h-full w-full rounded-lg overflow-hidden border flex items-center justify-center bg-gray-100">
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden shadow-md">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          mapTypeId: localSatelliteView ? 'satellite' : 'roadmap',
          tilt: localSatelliteView ? 45 : 0,
          mapTypeControl: false,
          streetViewControl: false,
          zoomControl: false,
          fullscreenControl: false,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            },
            {
              featureType: 'transit',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#e9f5f8' }]
            },
            {
              featureType: 'landscape',
              elementType: 'geometry',
              stylers: [{ color: '#f5f5f5' }]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#ffffff' }]
            }
          ]
        }}
      >
        {/* Building Markers */}
        {buildings.map(building => (
          <Marker
            key={building.id}
            position={{
              lat: building.coordinates[0],
              lng: building.coordinates[1]
            }}
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="${building.type === 'commercial' ? '#3b82f6' : '#10b981'}" opacity="0.2"/>
                  <circle cx="12" cy="12" r="6" fill="${building.type === 'commercial' ? '#3b82f6' : '#10b981'}" opacity="0.9"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(36, 36),
              anchor: new google.maps.Point(18, 18)
            }}
            onClick={() => {
              setActiveBuilding(building);
            }}
          />
        ))}

        {/* Info Window for active building */}
        {activeBuilding && (
          <InfoWindow
            position={{
              lat: activeBuilding.coordinates[0],
              lng: activeBuilding.coordinates[1]
            }}
            onCloseClick={() => setActiveBuilding(null)}
            options={{
              pixelOffset: new google.maps.Size(0, -30)
            }}
          >
            <div className="p-2 min-w-[200px]">
              <h3 className="font-bold text-base text-blue-800">{activeBuilding.name}</h3>
              <p className="text-sm text-gray-600">{activeBuilding.address}</p>
              <p className="text-sm mt-1">RTUs: <span className="font-semibold text-blue-600">{activeBuilding.rtuCount}</span></p>
              <div className="mt-2 flex gap-2">
                <button className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full transition-colors">Details</button>
                <button className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors">Directions</button>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Map Controls - Only show if map is loaded */}
      <MapControls map={map} />

      {/* Map Type Selector */}
      <MapTypeSelector 
        isSatellite={localSatelliteView} 
        setIsSatellite={handleSatelliteToggle} 
      />

      {/* Building Info Card (Google Maps-like) */}
      {activeBuilding && (
        <div className="absolute bottom-6 left-6 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-xs transform transition-all duration-200 hover:shadow-xl">
          <button 
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setActiveBuilding(null)}
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div className="flex items-start">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${activeBuilding.type === 'commercial' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="6" x2="12" y2="6.01"></line>
                <line x1="12" y1="10" x2="12" y2="10.01"></line>
                <line x1="12" y1="14" x2="12" y2="14.01"></line>
                <line x1="12" y1="18" x2="12" y2="18.01"></line>
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">{activeBuilding.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{activeBuilding.address}</p>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-2 rounded-md">
              <p className="text-xs text-gray-500">RTU Count</p>
              <p className="font-semibold text-blue-700">{activeBuilding.rtuCount}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded-md">
              <p className="text-xs text-gray-500">Building Type</p>
              <p className="font-semibold text-blue-700 capitalize">{activeBuilding.type}</p>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md text-sm font-medium transition-colors">
              View Details
            </button>
            <button className="flex-1 bg-gray-100 hover:bg-gray-200 py-2 rounded-md text-sm font-medium transition-colors">
              Get Directions
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
