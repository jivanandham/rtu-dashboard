# RTU Detection Model

This directory contains the machine learning components for detecting Rooftop Units (RTUs) in aerial/satellite imagery for the RTU Dashboard application.

## Overview

The RTU detection system uses a Convolutional Neural Network (CNN) based on MobileNetV2 for efficient and accurate detection of HVAC units on building rooftops. The system includes:

1. **Data Preparation**: Tools for preparing and preprocessing satellite/aerial imagery
2. **RTU Detector Model**: CNN model for detecting RTUs
3. **API**: FastAPI server to expose the model as a REST API

## Setup

### Prerequisites

- Python 3.8+
- pip (Python package manager)

### Installation

1. Create a virtual environment (recommended):
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

## Usage

### Data Preparation

The `data_preparation.py` script provides utilities for preparing your dataset:

```python
from data_preparation import create_dataset_structure, preprocess_image, augment_image

# Create directory structure for your dataset
create_dataset_structure('my_dataset')

# Preprocess an image
image = preprocess_image('path/to/image.jpg')

# Apply data augmentation
augmented_image = augment_image(image)
```

For quick testing, you can generate synthetic sample data:

```python
from data_preparation import generate_sample_data

# Generate 100 synthetic samples
generate_sample_data('sample_data', num_samples=100)
```

### Training the Model

```python
from rtu_detector import RTUDetector

# Create a new detector
detector = RTUDetector()

# Train the model
detector.train(
    train_data_dir='sample_data/train',
    validation_data_dir='sample_data/validation',
    epochs=10,
    batch_size=32
)

# Save the trained model
detector.save_model('models/rtu_detector.h5')
```

### Making Predictions

```python
import cv2
from rtu_detector import RTUDetector

# Load a trained model
detector = RTUDetector(model_path='models/rtu_detector.h5')

# Load an image
image = cv2.imread('path/to/image.jpg')
image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

# Make prediction
prediction = detector.predict(image)

if prediction:
    print(f"RTU detected with confidence: {prediction['confidence']}")
    print(f"Bounding box: {prediction['bbox']}")
else:
    print("No RTU detected")

# Visualize the prediction
if prediction:
    fig = detector.visualize_predictions(image, prediction)
    fig.savefig('prediction.png')
```

## Running the API

The API provides endpoints for RTU detection via HTTP requests:

```
python api.py
```

This will start a FastAPI server at http://localhost:8000.

### API Endpoints

- `GET /`: Check if the API is running
- `POST /detect`: Detect RTUs in a base64-encoded image
- `POST /detect-file`: Detect RTUs in an uploaded image file
- `POST /train`: Train the model with provided data

## Integration with the Dashboard

The RTU detection model is integrated with the Next.js dashboard through the `/rtu-detector` page, which provides a user-friendly interface for uploading images and viewing detection results.

## Model Architecture

The RTU detector uses transfer learning with MobileNetV2 as the base model, which provides a good balance between accuracy and efficiency. The model is designed to be lightweight enough to run on standard hardware while providing accurate RTU detection.

## Performance Considerations

- The model works best with high-resolution aerial imagery where RTUs are clearly visible
- For optimal performance, ensure images have good lighting and contrast
- The API is designed to handle one request at a time; for high-volume usage, consider scaling with a container orchestration system

## License

This project is licensed under the MIT License - see the LICENSE file for details.
