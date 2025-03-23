'use client';

import React from 'react';

interface Building {
  id: string;
  name: string;
  address: string;
  rtuCount: number;
  coordinates: [number, number];
  type: string;
  squareFeet: number;
}

interface CommercialBuildingsListProps {
  buildings: Building[];
  minSize?: number;
}

export default function CommercialBuildingsList({ buildings, minSize = 100000 }: CommercialBuildingsListProps) {
  // Filter for commercial buildings with size larger than minSize
  const largeCommercialBuildings = buildings
    .filter(building => building.type === 'commercial' && building.squareFeet >= minSize)
    .sort((a, b) => b.squareFeet - a.squareFeet); // Sort by size, largest first

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Large Commercial Buildings in Pittsburgh</h2>
      <p className="text-sm text-gray-500 mb-4">Buildings with {minSize.toLocaleString()} sq ft or more</p>
      
      {largeCommercialBuildings.length === 0 ? (
        <p className="text-gray-600">No large commercial buildings found.</p>
      ) : (
        <div className="space-y-4">
          {largeCommercialBuildings.map(building => (
            <div key={building.id} className="border-b pb-4">
              <h3 className="font-semibold text-lg">{building.name}</h3>
              <p className="text-gray-600">{building.address}</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-sm text-gray-500">Size:</span>
                  <span className="ml-2 font-medium">{building.squareFeet.toLocaleString()} sq ft</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">RTUs:</span>
                  <span className="ml-2 font-medium">{building.rtuCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
