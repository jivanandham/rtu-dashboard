"""
RTU Detector - Machine Learning Model for Rooftop Unit Detection

This module provides functionality to train and use a convolutional neural network (CNN)
for detecting rooftop HVAC units (RTUs) in aerial or satellite imagery.
"""

import os
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models, optimizers
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import matplotlib.pyplot as plt

class RTUDetector:
    """RTU detection model using transfer learning with MobileNetV2"""
    
    def __init__(self, img_size=(224, 224), model_path=None):
        """
        Initialize the RTU detector model
        
        Args:
            img_size: Input image size (height, width)
            model_path: Path to saved model weights (if loading a pre-trained model)
        """
        self.img_size = img_size
        self.model = None
        
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
        else:
            self._build_model()
    
    def _build_model(self):
        """Build the CNN model using transfer learning with MobileNetV2"""
        # Use MobileNetV2 as base model (efficient for deployment)
        base_model = MobileNetV2(
            input_shape=(*self.img_size, 3),
            include_top=False,
            weights='imagenet'
        )
        
        # Freeze the base model layers
        base_model.trainable = False
        
        # Create the model architecture
        model = models.Sequential([
            base_model,
            layers.GlobalAveragePooling2D(),
            layers.Dropout(0.2),
            layers.Dense(128, activation='relu'),
            layers.Dropout(0.2),
            # For RTU detection, we'll use two outputs:
            # 1. RTU present (binary classification)
            # 2. Bounding box coordinates (regression for x, y, width, height)
            layers.Dense(5, activation='sigmoid')  # [confidence, x, y, width, height]
        ])
        
        # Compile the model
        model.compile(
            optimizer=optimizers.Adam(learning_rate=0.001),
            loss='mse',  # Mean squared error for bounding box regression
            metrics=['accuracy']
        )
        
        self.model = model
        print("Model built successfully")
        
    def load_model(self, model_path):
        """Load a pre-trained model from disk"""
        self.model = models.load_model(model_path)
        print(f"Model loaded from {model_path}")
        
    def save_model(self, model_path):
        """Save the current model to disk"""
        if self.model:
            self.model.save(model_path)
            print(f"Model saved to {model_path}")
        else:
            print("No model to save")
    
    def train(self, train_data_dir, validation_data_dir, epochs=10, batch_size=32):
        """
        Train the model on the provided dataset
        
        Args:
            train_data_dir: Directory containing training images
            validation_data_dir: Directory containing validation images
            epochs: Number of training epochs
            batch_size: Batch size for training
            
        Returns:
            Training history
        """
        if not self.model:
            self._build_model()
            
        # Data augmentation for training
        train_datagen = ImageDataGenerator(
            rescale=1./255,
            rotation_range=20,
            width_shift_range=0.2,
            height_shift_range=0.2,
            shear_range=0.2,
            zoom_range=0.2,
            horizontal_flip=True,
            fill_mode='nearest'
        )
        
        # Only rescale validation images
        validation_datagen = ImageDataGenerator(rescale=1./255)
        
        # Load and augment training data
        train_generator = train_datagen.flow_from_directory(
            train_data_dir,
            target_size=self.img_size,
            batch_size=batch_size,
            class_mode='categorical'
        )
        
        # Load validation data
        validation_generator = validation_datagen.flow_from_directory(
            validation_data_dir,
            target_size=self.img_size,
            batch_size=batch_size,
            class_mode='categorical'
        )
        
        # Train the model
        history = self.model.fit(
            train_generator,
            steps_per_epoch=train_generator.samples // batch_size,
            epochs=epochs,
            validation_data=validation_generator,
            validation_steps=validation_generator.samples // batch_size
        )
        
        return history
    
    def fine_tune(self, train_data_dir, validation_data_dir, epochs=5, batch_size=32):
        """Fine-tune the model by unfreezing some layers of the base model"""
        if not self.model:
            raise ValueError("Model must be trained before fine-tuning")
            
        # Unfreeze the top layers of the base model
        base_model = self.model.layers[0]
        base_model.trainable = True
        
        # Freeze all layers except the last 10
        for layer in base_model.layers[:-10]:
            layer.trainable = False
            
        # Recompile the model with a lower learning rate
        self.model.compile(
            optimizer=optimizers.Adam(learning_rate=0.0001),  # Lower learning rate for fine-tuning
            loss='mse',
            metrics=['accuracy']
        )
        
        # Train with the same data generators as in the train method
        return self.train(train_data_dir, validation_data_dir, epochs, batch_size)
    
    def predict(self, image):
        """
        Predict RTU locations in a single image
        
        Args:
            image: Image as numpy array with shape (height, width, 3)
            
        Returns:
            List of detected RTUs with confidence scores and bounding boxes
        """
        if not self.model:
            raise ValueError("Model must be trained before prediction")
            
        # Preprocess the image
        img = tf.image.resize(image, self.img_size)
        img = img / 255.0  # Normalize
        img = np.expand_dims(img, axis=0)  # Add batch dimension
        
        # Make prediction
        predictions = self.model.predict(img)[0]
        
        # Parse predictions
        confidence = predictions[0]
        bbox = predictions[1:]  # [x, y, width, height]
        
        # Only return detections above a confidence threshold
        if confidence > 0.5:
            return {
                'confidence': float(confidence),
                'bbox': [float(x) for x in bbox]
            }
        else:
            return None
    
    def predict_batch(self, images):
        """
        Predict RTU locations in a batch of images
        
        Args:
            images: Batch of images as numpy array with shape (batch_size, height, width, 3)
            
        Returns:
            List of detected RTUs for each image
        """
        if not self.model:
            raise ValueError("Model must be trained before prediction")
            
        # Preprocess the images
        imgs = tf.image.resize(images, self.img_size)
        imgs = imgs / 255.0  # Normalize
        
        # Make predictions
        predictions = self.model.predict(imgs)
        
        results = []
        for pred in predictions:
            confidence = pred[0]
            bbox = pred[1:]  # [x, y, width, height]
            
            # Only return detections above a confidence threshold
            if confidence > 0.5:
                results.append({
                    'confidence': float(confidence),
                    'bbox': [float(x) for x in bbox]
                })
            else:
                results.append(None)
                
        return results
    
    def visualize_predictions(self, image, prediction):
        """
        Visualize RTU detection on an image
        
        Args:
            image: Original image as numpy array
            prediction: Prediction dictionary from predict method
            
        Returns:
            Matplotlib figure with the image and bounding box
        """
        if prediction is None:
            plt.imshow(image)
            plt.title("No RTUs detected")
            return
            
        # Extract bounding box
        x, y, width, height = prediction['bbox']
        confidence = prediction['confidence']
        
        # Scale bounding box to image dimensions
        img_height, img_width = image.shape[:2]
        x_scaled = x * img_width
        y_scaled = y * img_height
        width_scaled = width * img_width
        height_scaled = height * img_height
        
        # Create figure and axes
        fig, ax = plt.subplots(1)
        ax.imshow(image)
        
        # Create rectangle patch
        rect = plt.Rectangle(
            (x_scaled, y_scaled),
            width_scaled,
            height_scaled,
            linewidth=2,
            edgecolor='r',
            facecolor='none'
        )
        
        # Add rectangle to the plot
        ax.add_patch(rect)
        
        # Add confidence score
        plt.title(f"RTU detected (confidence: {confidence:.2f})")
        
        return fig

# Example usage
if __name__ == "__main__":
    # Create RTU detector
    detector = RTUDetector()
    
    # Print model summary
    detector.model.summary()
    
    print("RTU Detector model created. Use train() method to train the model on your dataset.")
