import os
import cv2
import yaml
import argparse
import numpy as np
import matplotlib.pyplot as plt
from tensorflow import keras
import tensorflow as tf
import albumentations as A

# Load configuration
with open('config.yaml', 'r') as f:
    config = yaml.safe_load(f)


class GradCAMExplainer:
    """
    Grad-CAM visualization for model explainability
    """
    
    def __init__(self, model_path=None):
        """
        Initialize Grad-CAM explainer
        
        Args:
            model_path: Path to trained model
        """
        if model_path is None:
            model_path = f"{config['paths']['models']}/best_model.keras"
            
            if not os.path.exists(model_path):
                model_path = f"{config['paths']['models']}/model_final.keras"
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found at {model_path}")
        
        print(f"■ Loading model from: {model_path}")
        self.model = keras.models.load_model(model_path)
        
        self.img_size = config['image']['size']
        self.class_names = config['classes']
        
        # Define preprocessing
        self.transform = A.Compose([
            A.Normalize(
                mean=config['image']['normalize_mean'],
                std=config['image']['normalize_std']
            )
        ])
        
        # Find last convolutional layer
        self.last_conv_layer = self._find_last_conv_layer()
        
        print(f"✓ Model loaded")
        print(f"  Last conv layer: {self.last_conv_layer.name}")
    
    def _find_last_conv_layer(self):
        """
        Automatically find the last convolutional layer in the model
        """
        for layer in reversed(self.model.layers):
            # Check if layer has a 4D output (batch, height, width, channels)
            if len(layer.output.shape) == 4:
                return layer
        
        raise ValueError("No convolutional layer found in model")
    
    def preprocess_image(self, image_path):
        """
        Load and preprocess image
        
        Args:
            image_path: Path to input image
            
        Returns:
            Original image (BGR), Preprocessed image array
        """
        # Read image
        img_bgr = cv2.imread(image_path)
        
        if img_bgr is None:
            raise ValueError(f"Could not read image: {image_path}")
        
        # Convert to RGB for processing
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        
        # Resize
        img_resized = cv2.resize(img_rgb, (self.img_size, self.img_size),
                                interpolation=cv2.INTER_LANCZOS4)
        
        # Apply normalization
        img_normalized = self.transform(image=img_resized)['image']
        
        # Add batch dimension
        img_batch = np.expand_dims(img_normalized, axis=0)
        
        return img_bgr, img_batch
    
    def generate_gradcam(self, image_path, class_idx=None):
        """
        Generate Grad-CAM heatmap
        
        Args:
            image_path: Path to input image
            class_idx: Target class index (if None, use predicted class)
            
        Returns:
            Heatmap array, predicted class, confidence
        """
        # Preprocess image
        img_original, img_array = self.preprocess_image(image_path)
        
        # Create gradient model
        grad_model = keras.models.Model(
            inputs=[self.model.input],
            outputs=[self.last_conv_layer.output, self.model.output]
        )
        
        # Compute gradients
        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(img_array)
            
            # Use predicted class if not specified
            if class_idx is None:
                class_idx = tf.argmax(predictions[0])
            
            # Get the score for the target class
            class_channel = predictions[:, class_idx]
        
        # Gradient of the target class with respect to the feature map
        grads = tape.gradient(class_channel, conv_outputs)
        
        # Global average pooling of gradients
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        
        # Weight feature maps by gradients
        conv_outputs = conv_outputs[0]
        pooled_grads = pooled_grads.numpy()
        conv_outputs = conv_outputs.numpy()
        
        # Multiply each feature map by corresponding gradient
        for i in range(pooled_grads.shape[0]):
            conv_outputs[:, :, i] *= pooled_grads[i]
        
        # Create heatmap
        heatmap = np.mean(conv_outputs, axis=-1)
        
        # Normalize heatmap
        heatmap = np.maximum(heatmap, 0)  # ReLU
        if heatmap.max() > 0:
            heatmap /= heatmap.max()
        
        # Get prediction info
        predicted_class_idx = int(tf.argmax(predictions[0]))
        confidence = float(predictions[0][predicted_class_idx])
        
        return heatmap, predicted_class_idx, confidence
    
    def visualize_gradcam(self, image_path, output_path=None, alpha=0.4):
        """
        Create and save Grad-CAM visualization
        
        Args:
            image_path: Path to input image
            output_path: Path to save visualization (optional)
            alpha: Transparency of heatmap overlay
            
        Returns:
            Path to saved visualization
        """
        # Generate heatmap
        heatmap, predicted_idx, confidence = self.generate_gradcam(image_path)
        
        # Load original image
        img_bgr = cv2.imread(image_path)
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        
        # Resize heatmap to match image size
        heatmap_resized = cv2.resize(heatmap, 
                                     (img_rgb.shape[1], img_rgb.shape[0]))
        
        # Convert heatmap to RGB
        heatmap_colored = cv2.applyColorMap(
            np.uint8(255 * heatmap_resized), 
            cv2.COLORMAP_JET
        )
        heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)
        
        # Superimpose heatmap on original image
        superimposed = cv2.addWeighted(
            img_rgb, 
            1 - alpha, 
            heatmap_colored, 
            alpha, 
            0
        )
        
        # Create visualization
        fig, axes = plt.subplots(1, 3, figsize=(18, 6))
        
        # Original image
        axes[0].imshow(img_rgb)
        axes[0].set_title('Original Image', fontsize=14, fontweight='bold')
        axes[0].axis('off')
        
        # Heatmap
        im = axes[1].imshow(heatmap_resized, cmap='jet')
        axes[1].set_title('Activation Heatmap', fontsize=14, fontweight='bold')
        axes[1].axis('off')
        plt.colorbar(im, ax=axes[1], fraction=0.046)
        
        # Superimposed
        axes[2].imshow(superimposed)
        predicted_class = self.class_names[predicted_idx]
        axes[2].set_title(
            f'Grad-CAM: {predicted_class}\nConfidence: {confidence*100:.2f}%',
            fontsize=14, 
            fontweight='bold'
        )
        axes[2].axis('off')
        
        plt.tight_layout()
        
        # Save
        if output_path is None:
            os.makedirs(f"{config['paths']['outputs']}/gradcam", exist_ok=True)
            filename = os.path.basename(image_path)
            output_path = f"{config['paths']['outputs']}/gradcam/gradcam_{filename}"
        
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"✓ Grad-CAM saved: {output_path}")
        
        return output_path
    
    def compare_all_classes(self, image_path, output_path=None):
        """
        Generate Grad-CAM for all classes
        
        Args:
            image_path: Path to input image
            output_path: Path to save visualization
        """
        img_bgr = cv2.imread(image_path)
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        
        n_classes = len(self.class_names)
        fig, axes = plt.subplots(2, n_classes, figsize=(5*n_classes, 10))
        
        for class_idx in range(n_classes):
            # Generate heatmap for this class
            heatmap, _, _ = self.generate_gradcam(image_path, class_idx=class_idx)
            
            # Resize heatmap
            heatmap_resized = cv2.resize(heatmap, 
                                        (img_rgb.shape[1], img_rgb.shape[0]))
            
            # Create colored heatmap
            heatmap_colored = cv2.applyColorMap(
                np.uint8(255 * heatmap_resized),
                cv2.COLORMAP_JET
            )
            heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)
            
            # Superimpose
            superimposed = cv2.addWeighted(img_rgb, 0.6, heatmap_colored, 0.4, 0)
            
            # Plot
            if n_classes > 1:
                axes[0, class_idx].imshow(heatmap_resized, cmap='jet')
                axes[0, class_idx].set_title(f'{self.class_names[class_idx]}\n(Heatmap)', 
                                            fontweight='bold')
                axes[0, class_idx].axis('off')
                
                axes[1, class_idx].imshow(superimposed)
                axes[1, class_idx].set_title(f'{self.class_names[class_idx]}\n(Overlay)', 
                                            fontweight='bold')
                axes[1, class_idx].axis('off')
            else:
                axes[0].imshow(heatmap_resized, cmap='jet')
                axes[0].set_title(f'{self.class_names[class_idx]}\n(Heatmap)', 
                                fontweight='bold')
                axes[0].axis('off')
                
                axes[1].imshow(superimposed)
                axes[1].set_title(f'{self.class_names[class_idx]}\n(Overlay)', 
                                fontweight='bold')
                axes[1].axis('off')
        
        plt.suptitle('Grad-CAM Analysis: All Classes', 
                     fontsize=16, fontweight='bold', y=0.98)
        plt.tight_layout()
        
        # Save
        if output_path is None:
            os.makedirs(f"{config['paths']['outputs']}/gradcam", exist_ok=True)
            filename = os.path.basename(image_path)
            output_path = f"{config['paths']['outputs']}/gradcam/all_classes_{filename}"
        
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"✓ Multi-class Grad-CAM saved: {output_path}")
        
        return output_path


def main():
    """Command line interface for Grad-CAM"""
    
    parser = argparse.ArgumentParser(
        description='Generate Grad-CAM visualizations for plant health predictions'
    )
    
    parser.add_argument('image_path', type=str,
                       help='Path to plant image')
    
    parser.add_argument('--model_path', type=str, default=None,
                       help='Path to trained model (optional)')
    
    parser.add_argument('--output', type=str, default=None,
                       help='Output path for visualization')
    
    parser.add_argument('--all_classes', action='store_true',
                       help='Generate Grad-CAM for all classes')
    
    parser.add_argument('--alpha', type=float, default=0.4,
                       help='Transparency of heatmap overlay (0-1)')
    
    args = parser.parse_args()
    
    # Initialize explainer
    try:
        explainer = GradCAMExplainer(model_path=args.model_path)
    except Exception as e:
        print(f"✗ Error loading model: {e}")
        return
    
    # Generate visualization
    try:
        if args.all_classes:
            explainer.compare_all_classes(args.image_path, args.output)
        else:
            explainer.visualize_gradcam(args.image_path, args.output, args.alpha)
        
        print("\n✓ Grad-CAM visualization completed!")
        
    except Exception as e:
        print(f"✗ Error generating Grad-CAM: {e}")


if __name__ == "__main__":
    main()