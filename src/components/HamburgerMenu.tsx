'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

interface RecentItem {
  id: string;
  name: string;
  type: 'building' | 'search' | 'other';
  timestamp: Date;
  href?: string;
}

interface SavedItem {
  id: string;
  name: string;
  type: 'building' | 'search' | 'other';
  savedAt: Date;
  href?: string;
  thumbnail?: string;
}

interface UserSettings {
  darkMode: boolean;
  mapType: 'satellite' | 'standard';
  notifications: boolean;
  dataRefreshInterval: number; // in minutes
}

interface HamburgerMenuProps {
  recentItems?: RecentItem[];
  savedItems?: SavedItem[];
  menuItems?: MenuItem[];
  position?: 'left' | 'right';
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  recentItems = [],
  savedItems = [],
  menuItems = [],
  position = 'left'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeView, setActiveView] = useState<'menu' | 'settings' | 'saved'>('menu');
  const menuRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<UserSettings>({
    darkMode: false,
    mapType: 'standard',
    notifications: true,
    dataRefreshInterval: 15
  });

  // Default menu items if none provided
  const defaultMenuItems: MenuItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
      href: '/'
    },
    {
      id: 'rtu-detector',
      label: 'RTU Detector',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
          <line x1="7" y1="2" x2="7" y2="22"></line>
          <line x1="17" y1="2" x2="17" y2="22"></line>
          <line x1="2" y1="12" x2="22" y2="12"></line>
        </svg>
      ),
      href: '/rtu-detector'
    },
    {
      id: 'saved',
      label: 'Saved Items',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
      href: '/saved-items'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      ),
      href: '/settings'
    }
  ];

  const itemsToShow = menuItems.length > 0 ? menuItems : defaultMenuItems;

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
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
            <line x1="12" y1="6" x2="12" y2="6.01"></line>
            <line x1="12" y1="10" x2="12" y2="10.01"></line>
            <line x1="12" y1="14" x2="12" y2="14.01"></line>
            <line x1="12" y1="18" x2="12" y2="18.01"></line>
          </svg>
        );
      case 'search':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        );
    }
  };

  // Handle settings changes
  const handleSettingChange = (setting: keyof UserSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    
    // In a real application, you would save these settings to localStorage or a backend
    localStorage.setItem('userSettings', JSON.stringify({
      ...settings,
      [setting]: value
    }));
  };

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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col justify-center items-center w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200"
        aria-label="Menu"
      >
        <div className={`w-5 h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${isOpen ? 'transform rotate-45 translate-y-1.5' : 'mb-1'}`}></div>
        <div className={`w-5 h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${isOpen ? 'opacity-0' : 'mb-1'}`}></div>
        <div className={`w-5 h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${isOpen ? 'transform -rotate-45 -translate-y-1.5' : ''}`}></div>
      </button>

      {/* Sidebar Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black z-[8000]"
              onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: position === 'left' ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: position === 'left' ? '-100%' : '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`fixed top-0 ${position === 'left' ? 'left-0' : 'right-0'} h-full w-80 bg-white shadow-xl z-[9001] flex flex-col`}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">RTU Dashboard</h2>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                    aria-label="Close menu"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold mr-4">
                    JK
                  </div>
                  <div>
                    <h3 className="font-medium">Jeeva Krishnasamy</h3>
                    <p className="text-sm text-blue-100">Administrator</p>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b">
                <button
                  className={`flex-1 py-3 font-medium text-sm transition-colors ${activeView === 'menu' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveView('menu')}
                >
                  Menu
                </button>
                <button
                  className={`flex-1 py-3 font-medium text-sm transition-colors ${activeView === 'saved' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveView('saved')}
                >
                  Saved
                </button>
                <button
                  className={`flex-1 py-3 font-medium text-sm transition-colors ${activeView === 'settings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveView('settings')}
                >
                  Settings
                </button>
              </div>

              {/* Content Area - scrollable */}
              <div className="flex-1 overflow-y-auto">
                {activeView === 'menu' && (
                  <div className="p-4">
                    {/* Main Navigation */}
                    <div className="mb-6">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Navigation</h3>
                      <div className="space-y-1">
                        {itemsToShow.map(item => (
                          <Link
                            key={item.id}
                            href={item.href || '#'}
                            onClick={() => {
                              if (item.onClick) item.onClick();
                              setIsOpen(false);
                            }}
                            className="flex items-center px-3 py-2.5 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                          >
                            <span className="mr-3 text-gray-500 group-hover:text-blue-600 transition-colors">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Recent Items */}
                    {recentItems.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Recent</h3>
                        <div className="space-y-1">
                          {recentItems.map(item => (
                            <Link
                              key={item.id}
                              href={item.href || '#'}
                              className="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors"
                            >
                              <span className="mr-3">{getItemIcon(item.type)}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.name}</p>
                                <p className="text-xs text-gray-500">{formatDate(item.timestamp)}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeView === 'saved' && (
                  <div className="p-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Saved Items</h3>
                    {savedItems.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {savedItems.map(item => (
                          <Link
                            key={item.id}
                            href={item.href || '#'}
                            className="block p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <div className="flex items-start">
                              <div className="mr-3 mt-0.5">{getItemIcon(item.type)}</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800">{item.name}</p>
                                <p className="text-xs text-gray-500 mt-1">Saved {formatDate(item.savedAt)}</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                          </svg>
                        </div>
                        <p className="text-gray-600">No saved items yet</p>
                        <p className="text-sm text-gray-500 mt-1">Items you save will appear here</p>
                      </div>
                    )}
                  </div>
                )}

                {activeView === 'settings' && (
                  <div className="p-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">Settings</h3>
                    
                    <div className="space-y-4">
                      {/* Dark Mode Toggle */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="mr-3 text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">Dark Mode</p>
                            <p className="text-xs text-gray-500">Switch to dark theme</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={settings.darkMode}
                            onChange={() => handleSettingChange('darkMode', !settings.darkMode)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      {/* Map Type Preference */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="mr-3 text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                            <line x1="8" y1="2" x2="8" y2="18"></line>
                            <line x1="16" y1="6" x2="16" y2="22"></line>
                          </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">Default Map View</p>
                            <p className="text-xs text-gray-500">Choose satellite or standard</p>
                          </div>
                        </div>
                        <select
                          className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
                          value={settings.mapType}
                          onChange={(e) => handleSettingChange('mapType', e.target.value)}
                        >
                          <option value="standard">Standard</option>
                          <option value="satellite">Satellite</option>
                        </select>
                      </div>
                      
                      {/* Notifications Toggle */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="mr-3 text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">Notifications</p>
                            <p className="text-xs text-gray-500">Enable push notifications</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={settings.notifications}
                            onChange={() => handleSettingChange('notifications', !settings.notifications)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      {/* Data Refresh Interval */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="mr-3 text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">Data Refresh</p>
                            <p className="text-xs text-gray-500">Update interval in minutes</p>
                          </div>
                        </div>
                        <select
                          className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
                          value={settings.dataRefreshInterval}
                          onChange={(e) => handleSettingChange('dataRefreshInterval', parseInt(e.target.value))}
                        >
                          <option value="5">5 min</option>
                          <option value="15">15 min</option>
                          <option value="30">30 min</option>
                          <option value="60">1 hour</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <p>RTU Dashboard v1.0</p>
                  </div>
                  <div>
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HamburgerMenu;
