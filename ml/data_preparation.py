"""
Data Preparation for RTU Detection Model

This script provides utilities for preparing and preprocessing satellite/aerial imagery
for training the RTU detection model.
"""

import os
import cv2
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from tensorflow.keras.utils import to_categorical

def create_dataset_structure(base_dir):
    """
    Create the necessary directory structure for the dataset
    
    Args:
        base_dir: Base directory for the dataset
    """
    # Create main directories
    os.makedirs(os.path.join(base_dir, 'train', 'rtu'), exist_ok=True)
    os.makedirs(os.path.join(base_dir, 'train', 'no_rtu'), exist_ok=True)
    os.makedirs(os.path.join(base_dir, 'validation', 'rtu'), exist_ok=True)
    os.makedirs(os.path.join(base_dir, 'validation', 'no_rtu'), exist_ok=True)
    
    print(f"Created dataset directory structure in {base_dir}")

def preprocess_image(image_path, target_size=(224, 224)):
    """
    Preprocess an image for the RTU detection model
    
    Args:
        image_path: Path to the image file
        target_size: Target size for the image (height, width)
        
    Returns:
        Preprocessed image as numpy array
    """
    # Read image
    img = cv2.imread(image_path)
    
    # Convert from BGR to RGB (OpenCV loads as BGR)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Resize to target size
    img = cv2.resize(img, target_size)
    
    return img

def augment_image(image, save_path=None, rotation_range=20, flip=True, brightness_range=(0.8, 1.2)):
    """
    Apply data augmentation to an image
    
    Args:
        image: Input image as numpy array
        save_path: Path to save the augmented image (optional)
        rotation_range: Range for random rotation in degrees
        flip: Whether to apply random horizontal flip
        brightness_range: Range for random brightness adjustment
        
    Returns:
        Augmented image as numpy array
    """
    # Make a copy of the image
    img = image.copy()
    
    # Random rotation
    if rotation_range > 0:
        angle = np.random.uniform(-rotation_range, rotation_range)
        h, w = img.shape[:2]
        M = cv2.getRotationMatrix2D((w/2, h/2), angle, 1)
        img = cv2.warpAffine(img, M, (w, h))
    
    # Random horizontal flip
    if flip and np.random.random() > 0.5:
        img = cv2.flip(img, 1)
    
    # Random brightness adjustment
    if brightness_range:
        alpha = np.random.uniform(brightness_range[0], brightness_range[1])
        img = cv2.convertScaleAbs(img, alpha=alpha, beta=0)
    
    # Save if path is provided
    if save_path:
        cv2.imwrite(save_path, cv2.cvtColor(img, cv2.COLOR_RGB2BGR))
    
    return img

def create_annotation(image_path, rtu_locations, output_path):
    """
    Create annotation file for an image with RTU locations
    
    Args:
        image_path: Path to the image file
        rtu_locations: List of RTU bounding boxes in format [(x, y, width, height), ...]
        output_path: Path to save the annotation file
    """
    # Read image to get dimensions
    img = cv2.imread(image_path)
    height, width = img.shape[:2]
    
    # Create annotation in YOLO format
    # YOLO format: <class> <x_center> <y_center> <width> <height>
    # where x, y, width, height are normalized to [0, 1]
    with open(output_path, 'w') as f:
        for x, y, w, h in rtu_locations:
            # Normalize coordinates
            x_center = (x + w/2) / width
            y_center = (y + h/2) / height
            norm_width = w / width
            norm_height = h / height
            
            # Write to file (class 0 for RTU)
            f.write(f"0 {x_center} {y_center} {norm_width} {norm_height}\n")
    
    print(f"Created annotation file: {output_path}")

def visualize_annotations(image_path, annotation_path):
    """
    Visualize image with its annotations
    
    Args:
        image_path: Path to the image file
        annotation_path: Path to the annotation file
        
    Returns:
        Matplotlib figure with the image and bounding boxes
    """
    # Read image
    img = cv2.imread(image_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    height, width = img.shape[:2]
    
    # Read annotations
    boxes = []
    with open(annotation_path, 'r') as f:
        for line in f:
            parts = line.strip().split()
            if len(parts) == 5:  # class, x_center, y_center, width, height
                cls, x_center, y_center, w, h = parts
                
                # Convert from normalized coordinates
                x_center = float(x_center) * width
                y_center = float(y_center) * height
                w = float(w) * width
                h = float(h) * height
                
                # Convert to (x, y, width, height) format
                x = x_center - w/2
                y = y_center - h/2
                
                boxes.append((x, y, w, h))
    
    # Create figure and axes
    fig, ax = plt.subplots(1, figsize=(10, 10))
    ax.imshow(img)
    
    # Add bounding boxes
    for x, y, w, h in boxes:
        rect = plt.Rectangle((x, y), w, h, linewidth=2, edgecolor='r', facecolor='none')
        ax.add_patch(rect)
    
    plt.title(f"Image with {len(boxes)} RTU annotations")
    
    return fig

def split_dataset(images_dir, annotations_dir, output_base_dir, test_size=0.2, random_state=42):
    """
    Split dataset into training and validation sets
    
    Args:
        images_dir: Directory containing images
        annotations_dir: Directory containing annotations
        output_base_dir: Base directory for the output dataset
        test_size: Proportion of the dataset to include in the validation split
        random_state: Random seed for reproducibility
    """
    # Get all image files
    image_files = [f for f in os.listdir(images_dir) if f.endswith(('.jpg', '.jpeg', '.png'))]
    
    # Split into training and validation sets
    train_files, val_files = train_test_split(image_files, test_size=test_size, random_state=random_state)
    
    # Create dataset structure
    create_dataset_structure(output_base_dir)
    
    # Copy files to their respective directories
    for files, split in [(train_files, 'train'), (val_files, 'validation')]:
        for file in files:
            # Get corresponding annotation file
            annotation_file = os.path.splitext(file)[0] + '.txt'
            annotation_path = os.path.join(annotations_dir, annotation_file)
            
            # Check if annotation exists
            if os.path.exists(annotation_path):
                # Read annotation to determine if it has RTUs
                with open(annotation_path, 'r') as f:
                    has_rtu = len(f.readlines()) > 0
                
                # Determine target class directory
                class_dir = 'rtu' if has_rtu else 'no_rtu'
                
                # Copy image
                img = cv2.imread(os.path.join(images_dir, file))
                output_img_path = os.path.join(output_base_dir, split, class_dir, file)
                cv2.imwrite(output_img_path, img)
                
                # Copy annotation if it has RTUs
                if has_rtu:
                    import shutil
                    output_ann_path = os.path.join(output_base_dir, split, class_dir, annotation_file)
                    shutil.copy(annotation_path, output_ann_path)
    
    # Print summary
    print(f"Dataset split complete:")
    print(f"  - Training: {len(train_files)} images")
    print(f"  - Validation: {len(val_files)} images")

def generate_sample_data(output_dir, num_samples=100, img_size=(224, 224)):
    """
    Generate synthetic sample data for testing
    
    Args:
        output_dir: Directory to save the generated data
        num_samples: Number of samples to generate
        img_size: Size of the generated images (width, height)
    """
    # Create directory structure
    create_dataset_structure(output_dir)
    
    # Generate samples
    for i in range(num_samples):
        # Create a blank image
        img = np.ones((img_size[1], img_size[0], 3), dtype=np.uint8) * 200  # Light gray background
        
        # Decide if this image will have an RTU (70% probability)
        has_rtu = np.random.random() < 0.7
        
        if has_rtu:
            # Add a simulated RTU (rectangle)
            rtu_width = np.random.randint(20, 50)
            rtu_height = np.random.randint(20, 50)
            rtu_x = np.random.randint(0, img_size[0] - rtu_width)
            rtu_y = np.random.randint(0, img_size[1] - rtu_height)
            
            # Draw the RTU
            cv2.rectangle(img, (rtu_x, rtu_y), (rtu_x + rtu_width, rtu_y + rtu_height), (100, 100, 100), -1)
            
            # Add some texture
            for _ in range(3):
                x = rtu_x + np.random.randint(5, rtu_width - 5)
                y = rtu_y + np.random.randint(5, rtu_height - 5)
                radius = np.random.randint(2, 5)
                cv2.circle(img, (x, y), radius, (50, 50, 50), -1)
            
            # Create annotation
            annotation = [(rtu_x, rtu_y, rtu_width, rtu_height)]
            
            # Determine output paths
            split = 'train' if i < int(num_samples * 0.8) else 'validation'
            img_path = os.path.join(output_dir, split, 'rtu', f'sample_{i:04d}.jpg')
            ann_path = os.path.join(output_dir, split, 'rtu', f'sample_{i:04d}.txt')
            
            # Save image
            cv2.imwrite(img_path, img)
            
            # Create and save annotation
            create_annotation(img_path, annotation, ann_path)
        else:
            # No RTU, just add some random shapes for texture
            for _ in range(5):
                x = np.random.randint(0, img_size[0])
                y = np.random.randint(0, img_size[1])
                radius = np.random.randint(5, 15)
                color = (np.random.randint(150, 250), np.random.randint(150, 250), np.random.randint(150, 250))
                cv2.circle(img, (x, y), radius, color, -1)
            
            # Determine output path
            split = 'train' if i < int(num_samples * 0.8) else 'validation'
            img_path = os.path.join(output_dir, split, 'no_rtu', f'sample_{i:04d}.jpg')
            
            # Save image
            cv2.imwrite(img_path, img)
    
    print(f"Generated {num_samples} synthetic samples in {output_dir}")

# Example usage
if __name__ == "__main__":
    # Generate sample data for testing
    generate_sample_data('sample_data', num_samples=100)
    
    print("Sample data generation complete. Use this data to test the RTU detection model.")
