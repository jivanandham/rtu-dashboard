This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# RTU Dashboard

A modern web application for monitoring and detecting Rooftop Units (RTUs) on commercial buildings using satellite imagery and machine learning.

## Features

### Interactive Map
- **Google Maps 3D Integration**: Replaced OpenStreetMap with Google Maps for enhanced 3D visualization (45° tilt view)
- **Satellite/Map Toggle**: Switch between satellite imagery and standard map views
- **Street View**: Integrated Google Street View for ground-level perspectives
- **Building Markers**: Interactive markers showing building locations with detailed information

### Building Management
- **Building Search**: Search for buildings by name, address, or other attributes
- **Commercial Buildings Filter**: Quickly filter to show only commercial buildings
- **Building Details**: View comprehensive information about each building including RTU count and square footage
- **Category Filtering**: Filter buildings by category (restaurants, hotels, etc.)

### RTU Detection
- **Image Upload**: Drag-and-drop functionality for uploading satellite/aerial imagery
- **Machine Learning Detection**: Utilizes a MobileNetV2-based model to detect RTUs in images
- **Detection Results**: Displays confidence scores and bounding box coordinates for detected RTUs
- **Visualization**: Highlights detected RTUs on the processed image

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ (for the RTU detection API)
- Google Maps API key with Maps JavaScript API and Street View API enabled

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/rtu-dashboard.git
cd rtu-dashboard
```

2. Install frontend dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the project root with your Google Maps API key:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

4. Install backend dependencies:
```bash
cd ml
pip install -r requirements.txt
```

### Running the Application

1. Start the RTU detection API server:
```bash
cd ml
python api.py  # For the full ML model
# OR
python mock_api.py  # For a lightweight mock API
```

2. In a separate terminal, start the Next.js development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to use the dashboard.

## Project Structure

- `/src`: Frontend source code
  - `/app`: Next.js app directory
  - `/components`: React components
    - `MapComponent.tsx`: Google Maps 3D integration
    - `RTUDetector.tsx`: RTU detection component
    - `SearchBar.tsx`: Search functionality with commercial buildings filter
    - `BuildingCard.tsx`: Building information display
    - `CommercialBuildingsList.tsx`: Commercial buildings listing
  - `/data`: Sample building data
- `/ml`: Machine learning backend
  - `rtu_detector.py`: RTU detection model implementation
  - `api.py`: FastAPI server for the RTU detection API
  - `mock_api.py`: Lightweight mock API for testing

## Technical Implementation

### Frontend
- **Framework**: Next.js with React and TypeScript
- **Styling**: Tailwind CSS for responsive design
- **Maps**: @react-google-maps/api for Google Maps integration
- **Animations**: Framer Motion for smooth transitions

### Backend
- **API Framework**: FastAPI
- **Machine Learning**: TensorFlow for RTU detection model
- **Image Processing**: OpenCV and PIL for image manipulation

## Recent Changes

1. **Google Maps 3D Integration**:
   - Replaced Leaflet/OpenStreetMap with Google Maps
   - Added 3D building visualization with 45° tilt view
   - Implemented satellite/map toggle and Street View

2. **Commercial Buildings Filter**:
   - Added a toggle button in the search bar to filter commercial buildings
   - Updated search functionality to filter by building type
   - Implemented visual feedback for active filters

3. **RTU Detection Improvements**:
   - Enhanced image upload and processing
   - Added error handling for API connectivity issues
   - Improved visualization of detection results

## API Documentation

### RTU Detection API

The RTU detection API provides endpoints for detecting RTUs in satellite/aerial imagery:

- `GET /`: Health check endpoint
- `POST /detect`: Detect RTUs in a base64-encoded image
- `POST /detect-file`: Detect RTUs in an uploaded image file
- `POST /train`: Train the RTU detection model with custom data

## Troubleshooting

### Google Maps API Issues
If you encounter a "Google Maps JavaScript API error: ApiProjectMapError", ensure:
1. You have created a `.env.local` file with a valid Google Maps API key
2. The API key has the Maps JavaScript API and Street View API enabled
3. There are no billing issues with your Google Cloud account
4. Your API key has proper domain restrictions (if applicable)

### RTU Detection API Connection
If you see "Failed to fetch" errors when using the RTU detector:
1. Ensure the API server is running (`python api.py` or `python mock_api.py`)
2. Check that the server is accessible at http://localhost:8000
3. Verify there are no CORS issues in your browser console

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Maps Platform for mapping capabilities
- TensorFlow team for machine learning tools
- Next.js team for the React framework
