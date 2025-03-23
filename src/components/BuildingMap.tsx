'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Define the Building interface
interface Building {
  id: string;
  name: string;
  address: string;
  rtuCount: number;
  coordinates: [number, number]; // [latitude, longitude]
}

interface BuildingMapProps {
  buildings: Building[];
}

// Create a dynamic import for the map component to avoid SSR issues
const MapWithNoSSR = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border flex items-center justify-center bg-gray-100">
      <p>Loading map...</p>
    </div>
  ),
});

export default function BuildingMap({ buildings }: BuildingMapProps) {
  return <MapWithNoSSR buildings={buildings} />;
}
