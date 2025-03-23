"""
Test script for RTU Detection Model

This script demonstrates how to use the RTU detection model with sample data.
It generates synthetic data, trains a model, and runs predictions.
"""

import os
import numpy as np
import matplotlib.pyplot as plt
from data_preparation import generate_sample_data, preprocess_image
from rtu_detector import RTUDetector

def main():
    print("RTU Detection Model Test")
    print("-----------------------")
    
    # Create directories
    os.makedirs("models", exist_ok=True)
    os.makedirs("sample_data", exist_ok=True)
    os.makedirs("results", exist_ok=True)
    
    # Step 1: Generate sample data
    print("\nStep 1: Generating sample data...")
    generate_sample_data("sample_data", num_samples=100)
    
    # Step 2: Create and train the model
    print("\nStep 2: Training model on sample data...")
    detector = RTUDetector()
    
    # Train the model with a small number of epochs for testing
    history = detector.train(
        train_data_dir="sample_data/train",
        validation_data_dir="sample_data/validation",
        epochs=3,  # Small number for quick testing
        batch_size=8
    )
    
    # Save the model
    detector.save_model("models/rtu_detector_test.h5")
    print("Model saved to models/rtu_detector_test.h5")
    
    # Step 3: Plot training history
    print("\nStep 3: Plotting training history...")
    plt.figure(figsize=(12, 4))
    
    plt.subplot(1, 2, 1)
    plt.plot(history.history['loss'])
    plt.plot(history.history['val_loss'])
    plt.title('Model Loss')
    plt.ylabel('Loss')
    plt.xlabel('Epoch')
    plt.legend(['Train', 'Validation'], loc='upper right')
    
    plt.subplot(1, 2, 2)
    plt.plot(history.history['accuracy'])
    plt.plot(history.history['val_accuracy'])
    plt.title('Model Accuracy')
    plt.ylabel('Accuracy')
    plt.xlabel('Epoch')
    plt.legend(['Train', 'Validation'], loc='lower right')
    
    plt.tight_layout()
    plt.savefig("results/training_history.png")
    print("Training history saved to results/training_history.png")
    
    # Step 4: Test predictions on sample images
    print("\nStep 4: Testing predictions...")
    
    # Get a few test images from the validation set
    test_images = []
    for root, _, files in os.walk("sample_data/validation"):
        for file in files:
            if file.endswith((".jpg", ".jpeg", ".png")):
                test_images.append(os.path.join(root, file))
                if len(test_images) >= 5:  # Limit to 5 test images
                    break
        if len(test_images) >= 5:
            break
    
    # Make predictions on test images
    for i, image_path in enumerate(test_images):
        # Load and preprocess image
        image = preprocess_image(image_path)
        
        # Make prediction
        prediction = detector.predict(image)
        
        # Visualize prediction
        fig = plt.figure(figsize=(10, 8))
        plt.imshow(image)
        plt.title(f"Test Image {i+1}")
        
        if prediction:
            # Extract bounding box
            x, y, w, h = prediction['bbox']
            x = int(x * image.shape[1])
            y = int(y * image.shape[0])
            w = int(w * image.shape[1])
            h = int(h * image.shape[0])
            
            # Draw bounding box
            rect = plt.Rectangle((x, y), w, h, linewidth=2, edgecolor='r', facecolor='none')
            plt.gca().add_patch(rect)
            plt.text(x, y-10, f"RTU: {prediction['confidence']:.2f}", color='red', fontsize=12, 
                     bbox=dict(facecolor='white', alpha=0.7))
        else:
            plt.text(10, 30, "No RTU detected", color='blue', fontsize=14, 
                    bbox=dict(facecolor='white', alpha=0.7))
        
        # Save result
        plt.tight_layout()
        plt.savefig(f"results/prediction_{i+1}.png")
        
        # Print result
        print(f"  Image {i+1}: {os.path.basename(image_path)}")
        if prediction:
            print(f"    RTU detected with confidence: {prediction['confidence']:.2f}")
            print(f"    Bounding box: {prediction['bbox']}")
        else:
            print("    No RTU detected")
    
    print("\nTest complete! Results saved to the 'results' directory.")
    print("You can now run the API server with: python api.py")

if __name__ == "__main__":
    main()
