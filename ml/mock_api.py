"""
Mock API for RTU Detection Model

This script provides a simple FastAPI server that simulates the RTU detection API
for testing the frontend without requiring the full ML model.
"""

import base64
import io
import os
import random
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from PIL import Image, ImageDraw

app = FastAPI(title="Mock RTU Detector API", description="Mock API for testing RTU detection frontend")

# Add CORS middleware to allow requests from the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class DetectionRequest(BaseModel):
    image: str  # Base64 encoded image

class RTUDetection(BaseModel):
    confidence: float
    bbox: List[float]  # [x, y, width, height]

class DetectionResponse(BaseModel):
    detections: List[RTUDetection]
    count: int
    processed_image: Optional[str] = None  # Base64 encoded image with bounding boxes

@app.get("/")
def read_root():
    return {"message": "Mock RTU Detector API is running"}

@app.post("/detect", response_model=DetectionResponse)
async def detect_rtus(request: DetectionRequest):
    """
    Simulate RTU detection in the provided image
    
    Args:
        request: DetectionRequest with base64 encoded image
        
    Returns:
        DetectionResponse with simulated detections
    """
    try:
        # Decode base64 image
        image_data = base64.b64decode(request.image.split(",")[1] if "," in request.image else request.image)
        image = Image.open(io.BytesIO(image_data))
        
        # Generate random detections
        num_detections = random.randint(1, 5)  # Random number of detections
        detections = []
        
        # Create a copy of the image to draw on
        draw_image = image.copy()
        draw = ImageDraw.Draw(draw_image)
        
        # Generate random detections
        for _ in range(num_detections):
            # Random bounding box
            img_width, img_height = image.size
            box_width = random.uniform(0.05, 0.2) * img_width
            box_height = random.uniform(0.05, 0.2) * img_height
            x = random.uniform(0.1, 0.9) * img_width - box_width/2
            y = random.uniform(0.1, 0.9) * img_height - box_height/2
            
            # Random confidence
            confidence = random.uniform(0.7, 0.98)
            
            # Add to detections
            detections.append(RTUDetection(
                confidence=confidence,
                bbox=[x / img_width, y / img_height, box_width / img_width, box_height / img_height]
            ))
            
            # Draw rectangle on image
            draw.rectangle(
                [(x, y), (x + box_width, y + box_height)], 
                outline="red", 
                width=3
            )
            
            # Draw confidence text
            draw.text(
                (x, y - 10), 
                f"{confidence:.2f}", 
                fill="red"
            )
        
        # Convert the image back to base64
        buffered = io.BytesIO()
        draw_image.save(buffered, format="PNG")
        processed_image = f"data:image/png;base64,{base64.b64encode(buffered.getvalue()).decode()}"
        
        return DetectionResponse(
            detections=detections,
            count=len(detections),
            processed_image=processed_image
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

if __name__ == "__main__":
    # Run the FastAPI server
    uvicorn.run(app, host="0.0.0.0", port=8000)
