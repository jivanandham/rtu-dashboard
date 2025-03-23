import React from 'react';
import { motion } from 'framer-motion';

interface Building {
  id: string;
  name: string;
  address: string;
  rtuCount: number;
  image?: string;
  lastUpdated?: Date;
}

interface BuildingCardProps {
  building: Building;
  onClick?: () => void;
}

export default function BuildingCard({ building, onClick }: BuildingCardProps) {
  // Default building image if none provided
  const buildingImage = building.image || 'https://via.placeholder.com/300x200?text=Building';
  
  // Format date if available
  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.div 
      className="mb-4 rounded-xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="relative h-40 overflow-hidden">
        <img 
          src={buildingImage} 
          alt={building.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 rounded-bl-lg font-medium">
          {building.rtuCount} RTUs
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-1 truncate">{building.name}</h3>
        <p className="text-gray-600 text-sm mb-3 truncate">{building.address}</p>
        
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Last updated: {formatDate(building.lastUpdated)}
          </div>
          
          <button 
            className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center"
            onClick={(e) => {
              e.stopPropagation();
              // Add functionality to view details
            }}
          >
            Details
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
