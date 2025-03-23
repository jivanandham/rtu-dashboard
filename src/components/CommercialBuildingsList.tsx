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
  minBuildingSize: number;
  setMinBuildingSize: (size: number) => void;
}

export default function CommercialBuildingsList({ 
  buildings, 
  minBuildingSize = 100000,
  setMinBuildingSize
}: CommercialBuildingsListProps) {
  // Filter for commercial buildings with size larger than minBuildingSize
  const largeCommercialBuildings = buildings
    .filter(building => building.type === 'commercial' && building.squareFeet >= minBuildingSize)
    .sort((a, b) => b.squareFeet - a.squareFeet); // Sort by size, largest first

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Commercial Buildings in Pittsburgh</h1>
        <button 
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Back to Map
        </button>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Minimum Building Size (sq ft)
        </label>
        <div className="flex gap-4">
          <button 
            onClick={() => setMinBuildingSize(100000)}
            className={`px-3 py-1 rounded-md ${minBuildingSize === 100000 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            100,000+
          </button>
          <button 
            onClick={() => setMinBuildingSize(500000)}
            className={`px-3 py-1 rounded-md ${minBuildingSize === 500000 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            500,000+
          </button>
          <button 
            onClick={() => setMinBuildingSize(1000000)}
            className={`px-3 py-1 rounded-md ${minBuildingSize === 1000000 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            1,000,000+
          </button>
        </div>
      </div>
      
      {largeCommercialBuildings.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No commercial buildings found with {minBuildingSize.toLocaleString()} sq ft or more.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {largeCommercialBuildings.map(building => (
            <div key={building.id} className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-bold text-lg">{building.name}</h3>
              <p className="text-gray-600 text-sm">{building.address}</p>
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
