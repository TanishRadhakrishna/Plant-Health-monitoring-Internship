import os
import yaml
import argparse
import tensorflow as tf
from tensorflow import keras
import numpy as np

# Load configuration
with open('config.yaml', 'r') as f:
    config = yaml.safe_load(f)


def convert_keras_to_h5(keras_model_path, h5_output_path=None, verify=True):
    """
    Safely convert .keras model to .h5 format with verification
    
    Args:
        keras_model_path: Path to .keras model file
        h5_output_path: Path for output .h5 file (optional)
        verify: Whether to verify conversion by comparing predictions
    
    Returns:
        Path to converted .h5 file
    """
    print("\n" + "="*70)
    print("KERAS TO H5 MODEL CONVERTER")
    print("="*70 + "\n")
    
    # Check if input file exists
    if not os.path.exists(keras_model_path):
        raise FileNotFoundError(f"Model not found: {keras_model_path}")
    
    print(f"■ Loading .keras model from: {keras_model_path}")
    
    try:
        # Load the .keras model
        model = keras.models.load_model(keras_model_path)
        print("✓ Model loaded successfully")
        
        # Print model info
        print(f"\n■ Model Information:")
        print(f"  Input shape: {model.input_shape}")
        print(f"  Output shape: {model.output_shape}")
        print(f"  Total parameters: {model.count_params():,}")
        
        # Generate output path if not provided
        if h5_output_path is None:
            base_name = os.path.splitext(keras_model_path)[0]
            h5_output_path = f"{base_name}.h5"
        
        print(f"\n■ Converting to .h5 format...")
        print(f"  Output path: {h5_output_path}")
        
        # Save in .h5 format
        model.save(h5_output_path, save_format='h5')
        print("✓ Model saved in .h5 format")
        
        # Get file sizes
        keras_size = os.path.getsize(keras_model_path) / (1024 * 1024)  # MB
        h5_size = os.path.getsize(h5_output_path) / (1024 * 1024)  # MB
        
        print(f"\n■ File Sizes:")
        print(f"  Original .keras: {keras_size:.2f} MB")
        print(f"  Converted .h5: {h5_size:.2f} MB")
        
        # Verification
        if verify:
            print(f"\n■ Verifying conversion...")
            verify_conversion(keras_model_path, h5_output_path)
        
        print("\n" + "="*70)
        print("✓ CONVERSION COMPLETED SUCCESSFULLY!")
        print("="*70)
        print(f"\nConverted model saved to: {h5_output_path}")
        print("="*70 + "\n")
        
        return h5_output_path
        
    except Exception as e:
        print(f"\n✗ Error during conversion: {e}")
        raise


def verify_conversion(keras_path, h5_path):
    """
    Verify that both models produce identical predictions
    
    Args:
        keras_path: Path to original .keras model
        h5_path: Path to converted .h5 model
    """
    print("  Loading both models for comparison...")
    
    # Load both models
    keras_model = keras.models.load_model(keras_path)
    h5_model = keras.models.load_model(h5_path)
    
    # Create random test input
    img_size = config['image']['size']
    test_input = np.random.randn(1, img_size, img_size, 3).astype(np.float32)
    
    # Get predictions from both models
    keras_pred = keras_model.predict(test_input, verbose=0)
    h5_pred = h5_model.predict(test_input, verbose=0)
    
    # Compare predictions
    max_diff = np.max(np.abs(keras_pred - h5_pred))
    mean_diff = np.mean(np.abs(keras_pred - h5_pred))
    
    print(f"  Maximum difference: {max_diff:.10f}")
    print(f"  Mean difference: {mean_diff:.10f}")
    
    # Check if predictions are essentially identical
    if max_diff < 1e-6:
        print("  ✓ Verification PASSED - Models produce identical predictions")
    elif max_diff < 1e-4:
        print("  ✓ Verification PASSED - Models produce nearly identical predictions")
        print("    (Small numerical differences are normal)")
    else:
        print(f"  ⚠ WARNING - Predictions differ by {max_diff:.6f}")
        print("    This may indicate a conversion issue")


def convert_all_models():
    """
    Convert all .keras models in the saved_models directory
    """
    models_dir = config['paths']['models']
    
    print("\n■ Searching for .keras models in:", models_dir)
    
    keras_models = [
        f for f in os.listdir(models_dir) 
        if f.endswith('.keras')
    ]
    
    if not keras_models:
        print("  No .keras models found")
        return
    
    print(f"  Found {len(keras_models)} .keras model(s):\n")
    
    for model_name in keras_models:
        keras_path = os.path.join(models_dir, model_name)
        h5_name = model_name.replace('.keras', '.h5')
        h5_path = os.path.join(models_dir, h5_name)
        
        print(f"■ Converting: {model_name}")
        
        try:
            convert_keras_to_h5(keras_path, h5_path, verify=True)
        except Exception as e:
            print(f"  ✗ Failed to convert {model_name}: {e}\n")
            continue


def main():
    """Command line interface for model conversion"""
    
    parser = argparse.ArgumentParser(
        description='Convert .keras models to .h5 format safely'
    )
    
    parser.add_argument('--model_path', type=str, default=None,
                       help='Path to specific .keras model to convert')
    
    parser.add_argument('--output_path', type=str, default=None,
                       help='Output path for .h5 file (optional)')
    
    parser.add_argument('--convert_all', action='store_true',
                       help='Convert all .keras models in saved_models directory')
    
    parser.add_argument('--no_verify', action='store_true',
                       help='Skip verification step')
    
    args = parser.parse_args()
    
    try:
        if args.convert_all:
            # Convert all models
            convert_all_models()
        
        elif args.model_path:
            # Convert specific model
            convert_keras_to_h5(
                args.model_path, 
                args.output_path,
                verify=not args.no_verify
            )
        
        else:
            # Default: convert best_model.keras
            models_dir = config['paths']['models']
            default_keras = os.path.join(models_dir, 'best_model.keras')
            
            if os.path.exists(default_keras):
                print("■ No model specified, converting default: best_model.keras\n")
                convert_keras_to_h5(default_keras, verify=not args.no_verify)
            else:
                print("■ No model specified and best_model.keras not found")
                print("\nUsage examples:")
                print("  python convert_keras_to_h5.py --convert_all")
                print("  python convert_keras_to_h5.py --model_path saved_models/best_model.keras")
                print("  python convert_keras_to_h5.py --model_path my_model.keras --output_path my_model.h5")
    
    except Exception as e:
        print(f"\n✗ Conversion failed: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()