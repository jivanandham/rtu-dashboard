'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface SavedItem {
  id: string;
  name: string;
  type: 'building' | 'search' | 'other';
  savedAt: Date;
  href?: string;
  thumbnail?: string;
  description?: string;
}

const SavedItemsPage: React.FC = () => {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [filterType, setFilterType] = useState<string>('all');

  // Load saved items from localStorage on component mount
  useEffect(() => {
    const storedItems = localStorage.getItem('savedItems');
    if (storedItems) {
      try {
        // Parse the JSON and convert string dates back to Date objects
        const parsedItems = JSON.parse(storedItems, (key, value) => {
          if (key === 'savedAt') return new Date(value);
          return value;
        });
        setSavedItems(parsedItems);
      } catch (e) {
        console.error('Failed to parse saved items', e);
        // If there's an error, use sample data instead
        setSavedItems(getSampleSavedItems());
      }
    } else {
      // If no saved items exist, use sample data
      setSavedItems(getSampleSavedItems());
    }
  }, []);

  // Get sample saved items for demonstration
  const getSampleSavedItems = (): SavedItem[] => {
    return [
      {
        id: 'saved1',
        name: 'Pittsburgh Office Building',
        type: 'building',
        savedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        href: '/buildings/123',
        thumbnail: 'https://via.placeholder.com/300x200?text=Office+Building',
        description: 'Large office building with 4 RTUs on the roof, located in downtown Pittsburgh.'
      },
      {
        id: 'saved2',
        name: 'Downtown Commercial District',
        type: 'search',
        savedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        href: '/search?q=downtown',
        description: 'Search results for commercial buildings in the downtown area.'
      },
      {
        id: 'saved3',
        name: 'Carrier RTU Model XYZ',
        type: 'other',
        savedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        href: '/rtu-detector?model=xyz',
        thumbnail: 'https://via.placeholder.com/300x200?text=RTU+Model',
        description: 'Detection results for Carrier RTU Model XYZ with 87% confidence.'
      },
      {
        id: 'saved4',
        name: 'Shopping Mall Complex',
        type: 'building',
        savedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        href: '/buildings/456',
        thumbnail: 'https://via.placeholder.com/300x200?text=Shopping+Mall',
        description: 'Large shopping mall with multiple RTUs, located in the suburbs.'
      }
    ];
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get icon for item type
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'building':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
            <line x1="12" y1="6" x2="12" y2="6.01"></line>
            <line x1="12" y1="10" x2="12" y2="10.01"></line>
            <line x1="12" y1="14" x2="12" y2="14.01"></line>
            <line x1="12" y1="18" x2="12" y2="18.01"></line>
          </svg>
        );
      case 'search':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        );
    }
  };

  // Remove a saved item
  const removeItem = (id: string) => {
    const updatedItems = savedItems.filter(item => item.id !== id);
    setSavedItems(updatedItems);
    
    // Update localStorage
    localStorage.setItem('savedItems', JSON.stringify(updatedItems));
  };

  // Filter items based on selected type
  const filteredItems = filterType === 'all' 
    ? savedItems 
    : savedItems.filter(item => item.type === filterType);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 hover:text-gray-900">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Saved Items</h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setFilterType('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                filterType === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setFilterType('building')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                filterType === 'building'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Buildings
            </button>
            <button
              onClick={() => setFilterType('search')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                filterType === 'search'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Searches
            </button>
            <button
              onClick={() => setFilterType('other')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                filterType === 'other'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Other
            </button>
          </div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                {item.thumbnail && (
                  <div className="h-48 w-full overflow-hidden">
                    <img 
                      src={item.thumbnail} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <span className="mr-2">{getItemIcon(item.type)}</span>
                      <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
                      aria-label="Remove item"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Saved {formatDate(item.savedAt)}</p>
                  {item.description && (
                    <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                  )}
                  <div className="mt-4">
                    <Link 
                      href={item.href || '/'}
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-400">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No saved items</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filterType === 'all' 
                ? "You haven't saved any items yet." 
                : `You haven't saved any ${filterType} items yet.`}
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Explore Dashboard
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SavedItemsPage;
