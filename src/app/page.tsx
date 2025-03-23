'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SearchBar from '@/components/SearchBar';
import BuildingCard from '@/components/BuildingCard';
import BuildingMap from '@/components/BuildingMap';
import axios from 'axios';

// Sample data for initial development
const sampleBuildings = [
  {
    id: '1',
    name: 'Downtown Office Complex',
    address: '123 Main St, Pittsburgh, PA 15213',
    rtuCount: 12,
    coordinates: [40.4406, -79.9959] as [number, number],
    type: 'commercial',
    squareFeet: 125000
  },
  {
    id: '2',
    name: 'Riverside Apartments',
    address: '456 River Ave, Pittsburgh, PA 15222',
    rtuCount: 8,
    coordinates: [40.4495, -80.0090] as [number, number],
    type: 'residential',
    squareFeet: 85000
  },
  {
    id: '3',
    name: 'Tech Innovation Center',
    address: '789 Innovation Dr, Pittsburgh, PA 15203',
    rtuCount: 15,
    coordinates: [40.4290, -79.9840] as [number, number],
    type: 'commercial',
    squareFeet: 180000
  },
  {
    id: '4',
    name: 'Shadyside Medical Center',
    address: '321 Health Ave, Pittsburgh, PA 15232',
    rtuCount: 20,
    coordinates: [40.4570, -79.9250] as [number, number],
    type: 'commercial',
    squareFeet: 210000
  },
  {
    id: '5',
    name: 'Oakland University Buildings',
    address: '567 Academic Way, Pittsburgh, PA 15213',
    rtuCount: 18,
    coordinates: [40.4440, -79.9530] as [number, number],
    type: 'educational',
    squareFeet: 150000
  },
  {
    id: '6',
    name: 'U.S. Steel Tower',
    address: '600 Grant St, Pittsburgh, PA 15219',
    rtuCount: 25,
    coordinates: [40.4413, -79.9948] as [number, number],
    type: 'commercial',
    squareFeet: 2300000
  },
  {
    id: '7',
    name: 'One PPG Place',
    address: '1 PPG Pl, Pittsburgh, PA 15222',
    rtuCount: 22,
    coordinates: [40.4414, -80.0036] as [number, number],
    type: 'commercial',
    squareFeet: 1500000
  },
  {
    id: '8',
    name: 'BNY Mellon Center',
    address: '500 Grant St, Pittsburgh, PA 15219',
    rtuCount: 18,
    coordinates: [40.4407, -79.9951] as [number, number],
    type: 'commercial',
    squareFeet: 1200000
  },
  {
    id: '9',
    name: 'Fifth Avenue Place',
    address: '120 Fifth Ave, Pittsburgh, PA 15222',
    rtuCount: 16,
    coordinates: [40.4422, -79.9977] as [number, number],
    type: 'commercial',
    squareFeet: 780000
  },
  {
    id: '10',
    name: 'Koppers Building',
    address: '436 Seventh Ave, Pittsburgh, PA 15219',
    rtuCount: 14,
    coordinates: [40.4418, -79.9962] as [number, number],
    type: 'commercial',
    squareFeet: 350000
  }
];

// Category buttons like in Google Maps
const categoryButtons = [
  { id: 'restaurants', label: 'Restaurants', icon: '🍽️' },
  { id: 'hotels', label: 'Hotels', icon: '🏨' },
  { id: 'things', label: 'Things to do', icon: '🎭' },
  { id: 'museums', label: 'Museums', icon: '🏛️' },
  { id: 'transit', label: 'Transit', icon: '🚆' },
  { id: 'pharmacies', label: 'Pharmacies', icon: '💊' },
  { id: 'atms', label: 'ATMs', icon: '💰' }
];

export default function Home() {
  const [search, setSearch] = useState('');
  const [buildings, setBuildings] = useState(sampleBuildings);
  const [filteredBuildings, setFilteredBuildings] = useState(sampleBuildings);
  const [isLoading, setIsLoading] = useState(false);
  const [isSatelliteView, setIsSatelliteView] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showCommercialList, setShowCommercialList] = useState(false);
  const [commercialMinSize, setCommercialMinSize] = useState(500000); // 500,000 sq ft minimum

  // Function to handle search
  const handleSearch = () => {
    if (!search.trim()) {
      setFilteredBuildings(buildings);
      return;
    }

    const filtered = buildings.filter(building => 
      building.name.toLowerCase().includes(search.toLowerCase()) || 
      building.address.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredBuildings(filtered);
  };

  // Function to handle category selection
  const handleCategoryClick = (categoryId: string) => {
    if (activeCategory === categoryId) {
      setActiveCategory(null);
    } else {
      setActiveCategory(categoryId);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isSatelliteView ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Top navigation bar */}
      <div className="flex items-center p-3 bg-white shadow-md z-10">
        {/* Menu button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        {/* Search bar */}
        <div className="flex-1 max-w-2xl">
          <SearchBar 
            search={search} 
            setSearch={setSearch} 
            handleSearch={handleSearch} 
          />
        </div>

        {/* Right side icons */}
        <div className="flex items-center ml-4 gap-2">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
            <span className="font-medium">JK</span>
          </div>
        </div>
      </div>

      {/* Category buttons */}
      <div className="flex items-center gap-2 p-2 overflow-x-auto bg-white shadow-sm">
        {categoryButtons.map(category => (
          <button
            key={category.id}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
              activeCategory === category.id 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-white border border-gray-300 hover:bg-gray-100'
            }`}
            onClick={() => handleCategoryClick(category.id)}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        {isSidebarOpen && (
          <motion.div 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            className="w-72 bg-white h-full shadow-lg z-10 absolute top-0 left-0 overflow-y-auto"
          >
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">RTU Dashboard</h2>
              <p className="text-sm text-gray-600">Monitoring rooftop units</p>
            </div>
            <div className="p-2">
              <div className="py-2 px-4 hover:bg-gray-100 rounded-md cursor-pointer flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span>Home</span>
              </div>
              <div className="py-2 px-4 hover:bg-gray-100 rounded-md cursor-pointer flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>Saved</span>
              </div>
              <div className="py-2 px-4 hover:bg-gray-100 rounded-md cursor-pointer flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>Recent</span>
              </div>
              <div className="py-2 px-4 hover:bg-gray-100 rounded-md cursor-pointer flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span>Shared</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Map area */}
        <div className="flex-1 relative">
          {!showCommercialList ? (
            <BuildingMap 
              buildings={filteredBuildings} 
              isSatelliteView={isSatelliteView}
              setIsSatelliteView={setIsSatelliteView}
            />
          ) : (
            <div className="p-4 h-full overflow-auto">
              <div className="mb-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Commercial Buildings in Pittsburgh</h1>
                <button 
                  onClick={() => setShowCommercialList(false)}
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
                    onClick={() => setCommercialMinSize(100000)}
                    className={`px-3 py-1 rounded-md ${commercialMinSize === 100000 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    100,000+
                  </button>
                  <button 
                    onClick={() => setCommercialMinSize(500000)}
                    className={`px-3 py-1 rounded-md ${commercialMinSize === 500000 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    500,000+
                  </button>
                  <button 
                    onClick={() => setCommercialMinSize(1000000)}
                    className={`px-3 py-1 rounded-md ${commercialMinSize === 1000000 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    1,000,000+
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sampleBuildings
                  .filter(building => building.type === 'commercial' && building.squareFeet >= commercialMinSize)
                  .sort((a, b) => b.squareFeet - a.squareFeet)
                  .map(building => (
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
            </div>
          )}
          
          {/* Floating button to show commercial buildings list */}
          {!showCommercialList && (
            <button
              onClick={() => setShowCommercialList(true)}
              className="absolute bottom-20 right-4 z-[1000] bg-white rounded-full shadow-lg p-3 hover:bg-gray-100"
              title="Show Commercial Buildings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
            </button>
          )}
        </div>

        {/* Building list - only shown when buildings are filtered */}
        {filteredBuildings.length < buildings.length && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 w-72 max-h-80 bg-white rounded-lg shadow-lg overflow-y-auto z-10"
          >
            <div className="p-3 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">Search Results</h3>
              <p className="text-sm text-gray-600">{filteredBuildings.length} buildings found</p>
            </div>
            <div className="p-2">
              {filteredBuildings.map(building => (
                <BuildingCard key={building.id} building={building} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
