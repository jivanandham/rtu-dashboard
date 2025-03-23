'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface RTUDetection {
  confidence: number;
  bbox: number[]; // [x, y, width, height]
}

interface DetectionResponse {
  detections: RTUDetection[];
  count: number;
  processed_image: string | null;
}

export default function RTUDetector() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Reset previous results
    setProcessedImage(null);
    setDetectionResult(null);
    setError(null);

    // Read the file as data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle drag and drop
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Reset previous results
    setProcessedImage(null);
    setDetectionResult(null);
    setError(null);

    // Read the file as data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Prevent default behavior for drag events
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  // Handle detect button click
  const handleDetect = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call the RTU detection API
      const response = await fetch('http://localhost:8000/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: selectedImage,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const result: DetectionResponse = await response.json();
      setDetectionResult(result);
      
      if (result.processed_image) {
        setProcessedImage(result.processed_image);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during detection');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle click on upload area
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Reset the form
  const handleReset = () => {
    setSelectedImage(null);
    setProcessedImage(null);
    setDetectionResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">RTU Detector</h2>
          <p className="text-gray-600 mt-2">
            Upload a satellite or aerial image to detect rooftop units (RTUs) using our machine learning model.
          </p>
        </div>
        <div className="hidden sm:block">
          <motion.div 
            initial={{ rotate: 0 }}
            animate={{ rotate: isLoading ? 360 : 0 }}
            transition={{ duration: 2, repeat: isLoading ? Infinity : 0, ease: "linear" }}
          >
            <svg 
              className="w-16 h-16 text-blue-500" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M21 10H3M16 15L21 10L16 5M3 10L8 15L3 5" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </div>
      </div>

      {/* File upload area */}
      <motion.div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer mb-8 transition-colors ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : selectedImage 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
        onClick={handleUploadClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
        
        {selectedImage ? (
          <div className="relative h-80 w-full">
            <Image
              src={selectedImage}
              alt="Selected image"
              fill
              style={{ objectFit: 'contain' }}
              className="rounded-lg"
            />
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              className="absolute top-2 right-2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-md hover:shadow-lg transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        ) : (
          <div className="py-16">
            <motion.div
              animate={{ y: isDragging ? -10 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <svg
                className="mx-auto h-16 w-16 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </motion.div>
            <h3 className="mt-4 text-lg font-medium text-gray-700">
              {isDragging ? 'Drop your image here' : 'Drag and drop your image here'}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              or <span className="text-blue-500 font-medium">browse</span> to select a file
            </p>
            <p className="mt-1 text-xs text-gray-400">
              PNG, JPG, GIF up to 10MB
            </p>
          </div>
        )}
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div 
            className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{error}</p>
            </div>
            <button 
              className="ml-auto text-red-500 hover:text-red-700 text-sm font-medium"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detect button */}
      <div className="flex justify-center mb-8">
        <motion.button
          className={`px-8 py-4 rounded-xl text-white font-medium text-lg shadow-md ${
            isLoading || !selectedImage
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 shadow-blue-200'
          }`}
          onClick={handleDetect}
          disabled={isLoading || !selectedImage}
          whileHover={!isLoading && selectedImage ? { scale: 1.05 } : {}}
          whileTap={!isLoading && selectedImage ? { scale: 0.95 } : {}}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            <span className="flex items-center">
              <svg className="mr-2" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.12 14.12C13.8454 14.4147 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1752 15.0074 10.8016 14.8565C10.4281 14.7056 10.0887 14.4811 9.80385 14.1962C9.51897 13.9113 9.29439 13.572 9.14351 13.1984C8.99262 12.8249 8.91853 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2219 9.18488 10.8539C9.34884 10.4859 9.58525 10.1547 9.88 9.88M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65663 6.06 6.06L17.94 17.94ZM9.9 4.24C10.5883 4.0789 11.2931 3.99834 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2047 20.84 15.19L9.9 4.24Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 1L23 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Detect RTUs
            </span>
          )}
        </motion.button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {detectionResult && (
          <motion.div 
            className="border rounded-xl p-6 bg-white shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Detection Results</h3>
            
            <div className="mb-6">
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {detectionResult.count === 0
                  ? 'No RTUs detected in this image.'
                  : `Detected ${detectionResult.count} RTU${
                      detectionResult.count !== 1 ? 's' : ''
                    } in this image.`}
              </div>
            </div>

            {processedImage && (
              <div className="relative h-96 w-full mb-6 rounded-lg overflow-hidden shadow-md">
                <Image
                  src={processedImage}
                  alt="Processed image with RTU detections"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            )}

            {detectionResult.detections.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-3 text-gray-700 text-lg">Detection Details:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {detectionResult.detections.map((detection, index) => (
                    <motion.div 
                      key={index} 
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800">RTU #{index + 1}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          detection.confidence > 0.7 
                            ? 'bg-green-100 text-green-800' 
                            : detection.confidence > 0.4 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {(detection.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="font-medium">X:</span> {detection.bbox[0].toFixed(2)}
                          </div>
                          <div>
                            <span className="font-medium">Y:</span> {detection.bbox[1].toFixed(2)}
                          </div>
                          <div>
                            <span className="font-medium">Width:</span> {detection.bbox[2].toFixed(2)}
                          </div>
                          <div>
                            <span className="font-medium">Height:</span> {detection.bbox[3].toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="mt-10 border-t pt-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">How it works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-5 rounded-xl">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h4 className="font-medium mb-2 text-gray-800">High-Quality Imagery</h4>
            <p className="text-gray-600 text-sm">
              Use high-resolution satellite or aerial imagery for the best detection results. Clear top-down views work best.
            </p>
          </div>
          
          <div className="bg-green-50 p-5 rounded-xl">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h4 className="font-medium mb-2 text-gray-800">AI Detection</h4>
            <p className="text-gray-600 text-sm">
              Our machine learning model analyzes the image and identifies rooftop HVAC units with precision and confidence scores.
            </p>
          </div>
          
          <div className="bg-purple-50 p-5 rounded-xl">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h4 className="font-medium mb-2 text-gray-800">Detailed Results</h4>
            <p className="text-gray-600 text-sm">
              Get detailed information about each detected RTU, including its location coordinates and confidence score.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
