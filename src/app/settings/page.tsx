'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface UserSettings {
  darkMode: boolean;
  mapType: 'satellite' | 'standard';
  notifications: boolean;
  dataRefreshInterval: number; // in minutes
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
    darkMode: false,
    mapType: 'standard',
    notifications: true,
    dataRefreshInterval: 15
  });
  
  const [isSaved, setIsSaved] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to parse saved settings', e);
      }
    }
  }, []);

  // Handle settings changes
  const handleSettingChange = (setting: keyof UserSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    setIsSaved(false);
  };

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
    setIsSaved(true);
    
    // Show saved message for 2 seconds
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

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
            <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
          </div>
          <button
            onClick={saveSettings}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Settings sections */}
          <div className="divide-y divide-gray-200">
            {/* Appearance Section */}
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Appearance</h2>
              
              <div className="space-y-6">
                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Dark Mode</h3>
                    <p className="text-sm text-gray-500">Enable dark mode for a better viewing experience at night</p>
                  </div>
                  <button 
                    onClick={() => handleSettingChange('darkMode', !settings.darkMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${settings.darkMode ? 'bg-blue-600' : 'bg-gray-200'}`}
                  >
                    <span 
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings.darkMode ? 'translate-x-6' : 'translate-x-1'}`} 
                    />
                  </button>
                </div>
                
                {/* Map Type Preference */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Default Map View</h3>
                  <p className="text-sm text-gray-500 mb-3">Choose the default map style when opening the dashboard</p>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => handleSettingChange('mapType', 'standard')}
                      className={`px-4 py-2 text-sm rounded-md ${settings.mapType === 'standard' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 border border-gray-200'}`}
                    >
                      Standard
                    </button>
                    <button 
                      onClick={() => handleSettingChange('mapType', 'satellite')}
                      className={`px-4 py-2 text-sm rounded-md ${settings.mapType === 'satellite' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 border border-gray-200'}`}
                    >
                      Satellite
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Notifications Section */}
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Notifications</h2>
              
              <div className="space-y-6">
                {/* Notifications Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Enable Notifications</h3>
                    <p className="text-sm text-gray-500">Receive notifications about RTU updates and alerts</p>
                  </div>
                  <button 
                    onClick={() => handleSettingChange('notifications', !settings.notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${settings.notifications ? 'bg-blue-600' : 'bg-gray-200'}`}
                  >
                    <span 
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings.notifications ? 'translate-x-6' : 'translate-x-1'}`} 
                    />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Data Settings Section */}
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Data Settings</h2>
              
              <div className="space-y-6">
                {/* Data Refresh Interval */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Data Refresh Interval</h3>
                  <p className="text-sm text-gray-500 mb-3">How often should the dashboard refresh data</p>
                  <select 
                    value={settings.dataRefreshInterval} 
                    onChange={(e) => handleSettingChange('dataRefreshInterval', parseInt(e.target.value))}
                    className="block w-full max-w-xs rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 border"
                  >
                    <option value="5">5 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Save confirmation toast */}
      <AnimatePresence>
        {isSaved && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg"
          >
            Settings saved successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPage;
