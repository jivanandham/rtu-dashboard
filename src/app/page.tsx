'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SearchBar from '@/components/SearchBar';
import BuildingCard from '@/components/BuildingCard';
import BuildingMap from '@/components/BuildingMap';
import axios from 'axios';
import Link from 'next/link';
import HamburgerMenu from '@/components/HamburgerMenu';
import CommercialBuildingsList from '@/components/CommercialBuildingsList';

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
  const [buildings, setBuildings] = useState(sampleBuildings);
  const [filteredBuildings, setFilteredBuildings] = useState(sampleBuildings);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSatelliteView, setIsSatelliteView] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCommercialBuildings, setShowCommercialBuildings] = useState(false);
  const [minBuildingSize, setMinBuildingSize] = useState(100000); // Default 100,000 sq ft
  const [showCommercialOnly, setShowCommercialOnly] = useState(false);
  
  const [recentItems, setRecentItems] = useState([
    {
      id: '1',
      name: 'Pittsburgh Tech Center',
      type: 'building' as const,
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      href: '/'
    },
    {
      id: '2',
      name: 'Commercial Buildings > 500,000 sq ft',
      type: 'search' as const,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      href: '/'
    },
    {
      id: '3',
      name: 'RTU Detection Results',
      type: 'other' as const,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      href: '/rtu-detector'
    }
  ]);

  const handleSearch = () => {
    let filtered = buildings;
    
    // Apply commercial-only filter if enabled
    if (showCommercialOnly) {
      filtered = filtered.filter(building => building.type === 'commercial');
    }
    
    // Apply search query filter if there's a query
    if (searchQuery.trim()) {
      filtered = filtered.filter(building => 
        building.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        building.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredBuildings(filtered);
  };

  // Toggle commercial buildings filter
  const toggleCommercialOnly = () => {
    setShowCommercialOnly(!showCommercialOnly);
  };

  useEffect(() => {
    handleSearch();
  }, [searchQuery, showCommercialOnly]); // Re-run search when either search query or commercial filter changes

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory('All');
    } else {
      setSelectedCategory(categoryId);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-3 flex items-center relative z-[9000] shadow-sm">
        <div className="p-2 rounded-full hover:bg-white/70 hover:shadow-sm transition-all duration-200 mr-3 z-[9000]">
          <HamburgerMenu recentItems={recentItems} position="left" />
        </div>
        <div className="flex-1 mx-2">
          <SearchBar 
            value={searchQuery} 
            onChange={setSearchQuery} 
            placeholder="Search for buildings, addresses, or RTUs..."
            handleSearch={handleSearch}
            showCommercialOnly={showCommercialOnly}
            onToggleCommercialOnly={toggleCommercialOnly}
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full hover:bg-white/70 hover:shadow-sm transition-all duration-200 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer">
            <span className="font-medium text-sm">JK</span>
          </div>
        </div>
      </header>

      {/* Category buttons */}
      <div className="flex items-center gap-2 p-3 overflow-x-auto bg-white shadow-sm border-b border-gray-100">
        {categoryButtons.map(category => (
          <button
            key={category.id}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-200 ${
              selectedCategory === category.id 
                ? 'bg-blue-100 text-blue-700 shadow-sm' 
                : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700'
            }`}
            onClick={() => handleCategoryClick(category.id)}
          >
            <span className="text-lg">{category.icon}</span>
            <span className="font-medium">{category.label}</span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex flex-1 relative">
        {/* Map or Commercial Buildings List */}
        {showCommercialBuildings ? (
          <CommercialBuildingsList 
            buildings={buildings}
            minBuildingSize={minBuildingSize}
            setMinBuildingSize={setMinBuildingSize}
          />
        ) : (
          <div className="flex-1 relative">
            {/* Map */}
            <BuildingMap 
              buildings={filteredBuildings}
              isSatelliteView={isSatelliteView}
            />
            
            
            {/* Map controls */}
            <div className="absolute right-4 top-4 flex flex-col gap-2">
              {/* View toggle */}
              <div className="bg-white rounded-md shadow-md p-1">
                <button 
                  className={`p-2 rounded-md ${!isSatelliteView ? 'bg-gray-100' : ''}`}
                  onClick={() => setIsSatelliteView(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                </button>
                <button 
                  className={`p-2 rounded-md ${isSatelliteView ? 'bg-gray-100' : ''}`}
                  onClick={() => setIsSatelliteView(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                    <line x1="8" y1="2" x2="8" y2="18"></line>
                    <line x1="16" y1="6" x2="16" y2="22"></line>
                  </svg>
                </button>
              </div>
              
              {/* Zoom controls */}
              <div className="bg-white rounded-md shadow-md p-1 flex flex-col">
                <button className="p-2 rounded-md hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    <line x1="11" y1="8" x2="11" y2="14"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                  </svg>
                </button>
                <button className="p-2 rounded-md hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                  </svg>
                </button>
              </div>
              
              {/* Street view */}
              <button className="bg-white p-2 rounded-md shadow-md hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
              
              {/* Commercial buildings button */}
              <button 
                className="bg-white p-2 rounded-md shadow-md hover:bg-gray-100"
                onClick={() => setShowCommercialBuildings(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                  <line x1="12" y1="6" x2="12" y2="6.01"></line>
                  <line x1="12" y1="10" x2="12" y2="10.01"></line>
                  <line x1="12" y1="14" x2="12" y2="14.01"></line>
                  <line x1="12" y1="18" x2="12" y2="18.01"></line>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
