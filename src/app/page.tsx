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
    coordinates: [40.4406, -79.9959] as [number, number]
  },
  {
    id: '2',
    name: 'Riverside Apartments',
    address: '456 River Ave, Pittsburgh, PA 15222',
    rtuCount: 8,
    coordinates: [40.4495, -80.0090] as [number, number]
  },
  {
    id: '3',
    name: 'Tech Innovation Center',
    address: '789 Innovation Dr, Pittsburgh, PA 15203',
    rtuCount: 15,
    coordinates: [40.4290, -79.9840] as [number, number]
  }
];

export default function Home() {
  const [search, setSearch] = useState('');
  const [buildings, setBuildings] = useState(sampleBuildings);
  const [filteredBuildings, setFilteredBuildings] = useState(sampleBuildings);
  const [isLoading, setIsLoading] = useState(false);

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

  // In a real application, you would fetch data from your API
  // useEffect(() => {
  //   const fetchBuildings = async () => {
  //     setIsLoading(true);
  //     try {
  //       const response = await axios.get('/api/buildings');
  //       setBuildings(response.data);
  //       setFilteredBuildings(response.data);
  //     } catch (error) {
  //       console.error('Error fetching buildings:', error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   
  //   fetchBuildings();
  // }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen p-6 bg-gray-50"
    >
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">RTU Dashboard</h1>
        <p className="text-gray-600">Monitor and manage rooftop units across buildings</p>
      </header>

      <main className="max-w-7xl mx-auto">
        <SearchBar 
          search={search} 
          setSearch={setSearch} 
          handleSearch={handleSearch} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Buildings</h2>
              {isLoading ? (
                <p>Loading buildings...</p>
              ) : filteredBuildings.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {filteredBuildings.map(building => (
                    <BuildingCard key={building.id} building={building} />
                  ))}
                </div>
              ) : (
                <p>No buildings found matching your search.</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Map View</h2>
              <BuildingMap buildings={filteredBuildings} />
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p> 2025 RTU Dashboard. All rights reserved.</p>
      </footer>
    </motion.div>
  );
}
