import os
import cv2
import yaml
import argparse
import numpy as np
from tensorflow import keras
import albumentations as A

# Load configuration
with open('config.yaml', 'r') as f:
    config = yaml.safe_load(f)


class PlantHealthPredictor:
    """
    Plant health prediction inference class
    """
    
    def __init__(self, model_path=None):
        """
        Initialize predictor with trained model
        
        Args:
            model_path: Path to saved model file
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
        
        # Define preprocessing transform
        self.transform = A.Compose([
            A.Normalize(
                mean=config['image']['normalize_mean'],
                std=config['image']['normalize_std']
            )
        ])
        
        print(f"✓ Model loaded successfully")
        print(f"  Classes: {', '.join(self.class_names)}")
    
    def preprocess_image(self, image_path):
        """
        Load and preprocess image for inference
        
        Args:
            image_path: Path to input image
            
        Returns:
            Preprocessed image array
        """
        # Read image
        img = cv2.imread(image_path)
        
        if img is None:
            raise ValueError(f"Could not read image: {image_path}")
        
        # Convert BGR to RGB
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Resize
        img = cv2.resize(img, (self.img_size, self.img_size), 
                        interpolation=cv2.INTER_LANCZOS4)
        
        # Apply normalization
        img = self.transform(image=img)['image']
        
        # Add batch dimension
        img = np.expand_dims(img, axis=0)
        
        return img
    
    def predict(self, image_path, return_probabilities=False):
        """
        Predict plant health condition
        
        Args:
            image_path: Path to input image
            return_probabilities: If True, return class probabilities
            
        Returns:
            Dictionary with prediction results
        """
        # Preprocess image
        img = self.preprocess_image(image_path)
        
        # Get predictions
        probabilities = self.model.predict(img, verbose=0)[0]
        
        # Get predicted class
        predicted_class_idx = np.argmax(probabilities)
        predicted_class = self.class_names[predicted_class_idx]
        confidence = probabilities[predicted_class_idx]
        
        # === Category & Subtype mapping (ADD HERE) ===
        if predicted_class.startswith("Pest_"):
            category = "Pest"
            subtype = predicted_class.replace("Pest_", "")
        elif predicted_class.startswith("Nutrient_"):
            category = "Nutrient Deficiency"
            subtype = predicted_class.replace("Nutrient_", "")
        else:
            category = predicted_class
            subtype = None
        
        result = {
            'predicted_class': predicted_class,
            'category': category,
            'subtype': subtype,
            'confidence': float(confidence),
            'confidence_percentage': float(confidence * 100)
        }
        
        if return_probabilities:
            result['all_probabilities'] = {
                class_name: float(prob) 
                for class_name, prob in zip(self.class_names, probabilities)
            }
        
        return result
    
    def predict_batch(self, image_paths):
        """
        Predict multiple images at once
        
        Args:
            image_paths: List of image paths
            
        Returns:
            List of prediction dictionaries
        """
        results = []
        
        for image_path in image_paths:
            try:
                result = self.predict(image_path, return_probabilities=True)
                result['image_path'] = image_path
                results.append(result)
            except Exception as e:
                print(f"Error processing {image_path}: {e}")
                results.append({
                    'image_path': image_path,
                    'error': str(e)
                })
        
        return results
    
    def predict_with_explanation(self, image_path):
        """
        Predict and provide interpretation
        
        Args:
            image_path: Path to input image
            
        Returns:
            Dictionary with prediction and explanation
        """
        result = self.predict(image_path, return_probabilities=True)
        
        # Add interpretation based on predicted class
        explanations = {
            "Healthy": "The plant appears healthy with no visible issues.",

            "Pest_Fungal": "Fungal infection detected. Look for powdery spots or mold.",
            "Pest_Bacterial": "Bacterial infection detected. Look for water-soaked lesions.",
            "Pest_Insect": "Insect damage detected. Look for holes or chewed edges.",
            
            "Nutrient_Nitrogen": "Nitrogen deficiency detected. Yellowing of older leaves.",
            "Nutrient_Potassium": "Potassium deficiency detected. Leaf edge browning and weak stems.",
            "Water_Stress": "Water stress detected. Check watering conditions."
        }
        
        result['explanation'] = explanations.get(
            result['predicted_class'], 
            "Unable to provide specific explanation."
        )
        
        # Add confidence interpretation
        confidence = result['confidence']
        if confidence > 0.9:
            result['confidence_level'] = "Very High"
        elif confidence > 0.75:
            result['confidence_level'] = "High"
        elif confidence > 0.6:
            result['confidence_level'] = "Moderate"
        else:
            result['confidence_level'] = "Low"
            result['warning'] = "Low confidence prediction. Consider manual inspection or retaking the image."
        
        return result


def print_prediction_result(result):
    """Pretty print prediction result"""
    print("\n" + "="*70)
    print("PREDICTION RESULT")
    print("="*70)
    
    if 'error' in result:
        print(f"\n✗ Error: {result['error']}")
        return
    
    print(f"\nPredicted Class: {result['predicted_class']}")
    print(f"Confidence: {result['confidence_percentage']:.2f}%")
    
    if 'confidence_level' in result:
        print(f"Confidence Level: {result['confidence_level']}")
    
    if 'explanation' in result:
        print(f"\nExplanation:\n  {result['explanation']}")
    
    if 'warning' in result:
        print(f"\n⚠ Warning: {result['warning']}")
    
    if 'all_probabilities' in result:
        print("\nAll Class Probabilities:")
        for class_name, prob in result['all_probabilities'].items():
            bar_length = int(prob * 50)
            bar = '█' * bar_length + '░' * (50 - bar_length)
            print(f"  {class_name:25} {bar} {prob*100:5.2f}%")
    
    print("="*70 + "\n")


def main():
    """Command line interface for inference"""
    
    parser = argparse.ArgumentParser(
        description='Plant Health Prediction Inference'
    )
    
    parser.add_argument('image_path', type=str,
                       help='Path to plant image')
    
    parser.add_argument('--model_path', type=str, default=None,
                       help='Path to trained model (optional)')
    
    parser.add_argument('--explain', action='store_true',
                       help='Provide detailed explanation')
    
    parser.add_argument('--save', action='store_true',
                       help='Save prediction result to file')
    
    args = parser.parse_args()
    
    # Initialize predictor
    try:
        predictor = PlantHealthPredictor(model_path=args.model_path)
    except Exception as e:
        print(f"✗ Error loading model: {e}")
        return
    
    # Make prediction
    try:
        if args.explain:
            result = predictor.predict_with_explanation(args.image_path)
        else:
            result = predictor.predict(args.image_path, return_probabilities=True)
        
        # Print result
        print_prediction_result(result)
        
        # Save if requested
        if args.save:
            import json
            output_path = f"{config['paths']['outputs']}/prediction_result.json"
            os.makedirs(config['paths']['outputs'], exist_ok=True)
            
            with open(output_path, 'w') as f:
                json.dump(result, f, indent=2)
            
            print(f"✓ Result saved to: {output_path}")
        
    except Exception as e:
        print(f"✗ Prediction error: {e}")


if __name__ == "__main__":
    main()