"""
API for RTU Detection Model

This script provides a FastAPI server to expose the RTU detection model as a REST API.
"""

import os
import io
import base64
import numpy as np
import cv2
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from PIL import Image

# Import our RTU detector
from rtu_detector import RTUDetector

app = FastAPI(title="RTU Detector API", description="API for detecting RTUs in aerial/satellite imagery")

# Add CORS middleware to allow requests from the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the RTU detector
MODEL_PATH = os.environ.get("MODEL_PATH", "models/rtu_detector.h5")
detector = None

# Load the model if it exists
if os.path.exists(MODEL_PATH):
    detector = RTUDetector(model_path=MODEL_PATH)
else:
    # Create a new model
    detector = RTUDetector()
    # If we have a sample data directory, train on it
    if os.path.exists("sample_data"):
        print("Training on sample data...")
        detector.train(
            train_data_dir="sample_data/train",
            validation_data_dir="sample_data/validation",
            epochs=5,
            batch_size=8
        )
        # Save the model
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        detector.save_model(MODEL_PATH)

# Request models
class DetectionRequest(BaseModel):
    image: str  # Base64 encoded image

class RTUDetection(BaseModel):
    confidence: float
    bbox: List[float]  # [x, y, width, height]

class DetectionResponse(BaseModel):
    detections: List[Optional[RTUDetection]]
    count: int
    processed_image: Optional[str] = None  # Base64 encoded image with bounding boxes

@app.get("/")
def read_root():
    return {"message": "RTU Detector API is running"}

@app.post("/detect", response_model=DetectionResponse)
async def detect_rtus(request: DetectionRequest):
    """
    Detect RTUs in the provided image
    
    Args:
        request: DetectionRequest with base64 encoded image
        
    Returns:
        DetectionResponse with list of detections and count
    """
    if not detector:
        raise HTTPException(status_code=500, detail="Model not initialized")
    
    try:
        # Decode base64 image
        image_data = base64.b64decode(request.image.split(",")[1] if "," in request.image else request.image)
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to numpy array
        image_np = np.array(image)
        
        # Make prediction
        prediction = detector.predict(image_np)
        
        # Create response
        if prediction:
            detections = [RTUDetection(confidence=prediction["confidence"], bbox=prediction["bbox"])]
            count = 1
        else:
            detections = []
            count = 0
        
        # Visualize detections
        if prediction:
            fig = detector.visualize_predictions(image_np, prediction)
            
            # Save figure to bytes
            buf = io.BytesIO()
            fig.savefig(buf, format="png")
            buf.seek(0)
            
            # Encode as base64
            processed_image = f"data:image/png;base64,{base64.b64encode(buf.read()).decode('utf-8')}"
        else:
            processed_image = None
        
        return DetectionResponse(detections=detections, count=count, processed_image=processed_image)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect-file")
async def detect_rtus_file(file: UploadFile = File(...)):
    """
    Detect RTUs in an uploaded image file
    
    Args:
        file: Uploaded image file
        
    Returns:
        DetectionResponse with list of detections and count
    """
    if not detector:
        raise HTTPException(status_code=500, detail="Model not initialized")
    
    try:
        # Read image file
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Convert to numpy array
        image_np = np.array(image)
        
        # Make prediction
        prediction = detector.predict(image_np)
        
        # Create response
        if prediction:
            detections = [RTUDetection(confidence=prediction["confidence"], bbox=prediction["bbox"])]
            count = 1
        else:
            detections = []
            count = 0
        
        # Visualize detections
        if prediction:
            fig = detector.visualize_predictions(image_np, prediction)
            
            # Save figure to bytes
            buf = io.BytesIO()
            fig.savefig(buf, format="png")
            buf.seek(0)
            
            # Encode as base64
            processed_image = f"data:image/png;base64,{base64.b64encode(buf.read()).decode('utf-8')}"
        else:
            processed_image = None
        
        return DetectionResponse(detections=detections, count=count, processed_image=processed_image)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train")
async def train_model(
    train_dir: str = Form(...),
    validation_dir: str = Form(...),
    epochs: int = Form(10),
    batch_size: int = Form(32)
):
    """
    Train the RTU detection model
    
    Args:
        train_dir: Directory containing training data
        validation_dir: Directory containing validation data
        epochs: Number of training epochs
        batch_size: Batch size for training
        
    Returns:
        Training status
    """
    if not detector:
        raise HTTPException(status_code=500, detail="Model not initialized")
    
    try:
        # Train the model
        history = detector.train(
            train_data_dir=train_dir,
            validation_data_dir=validation_dir,
            epochs=epochs,
            batch_size=batch_size
        )
        
        # Save the model
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        detector.save_model(MODEL_PATH)
        
        return {"status": "success", "message": "Model trained successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Run the FastAPI server
    uvicorn.run(app, host="0.0.0.0", port=8000)
