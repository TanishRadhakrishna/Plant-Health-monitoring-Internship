import os
import yaml
import argparse
import numpy as np
import tensorflow as tf
from datetime import datetime
from collections import Counter

from model import (
    build_model, 
    compile_model, 
    unfreeze_model,
    get_callbacks,
    print_model_summary
)
from data_generator import get_data_generators

# Load configuration
with open('config.yaml', 'r') as f:
    config = yaml.safe_load(f)

# Create necessary directories
os.makedirs(config['paths']['models'], exist_ok=True)
os.makedirs(config['paths']['logs'], exist_ok=True)


def calculate_class_weights():
    """
    Calculate class weights to handle imbalanced datasets
    """
    train_file = os.path.join(config['paths']['splits'], 'train.txt')
    
    # Count samples per class
    class_counts = Counter()
    with open(train_file, 'r') as f:
        for line in f:
            cls = line.strip().split('/')[0]
            class_counts[cls] += 1
    
    # Calculate weights
    total = sum(class_counts.values())
    n_classes = len(class_counts)
    
    class_weights = {}
    label_map = {cls: idx for idx, cls in enumerate(config['classes'])}
    
    print("\n" + "="*70)
    print("CLASS DISTRIBUTION & WEIGHTS")
    print("="*70)
    
    for cls in config['classes']:
        count = class_counts.get(cls, 0)
        if count > 0:
            weight = total / (n_classes * count)
            class_weights[label_map[cls]] = weight
            print(f"{cls:25} : {count:4} samples | Weight: {weight:.3f}")
        else:
            class_weights[label_map[cls]] = 1.0
            print(f"{cls:25} : {count:4} samples | Weight: 1.000 (no samples!)")
    
    print("="*70 + "\n")
    
    # Check if weights are needed
    max_weight = max(class_weights.values())
    min_weight = min(class_weights.values())
    
    if max_weight / min_weight > 2:
        print("⚠ Significant class imbalance detected - using class weights\n")
        return class_weights
    else:
        print("✓ Classes relatively balanced - no weights needed\n")
        return None


def train_phase_1(model, train_gen, val_gen, class_weights=None, epochs=20):
    """
    Phase 1: Train with frozen base model
    Only train the classification head
    """
    print("\n" + "="*70)
    print("PHASE 1: Training Classification Head (Base Model Frozen)")
    print("="*70 + "\n")
    
    history = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=epochs,
        class_weight=class_weights,
        callbacks=get_callbacks(patience=10),
        verbose=1
    )
    
    return history


def train_phase_2(model, base_model, train_gen, val_gen, class_weights=None, epochs=80):
    """
    Phase 2: Fine-tune entire model
    Unfreeze base model and train with lower learning rate
    """
    print("\n" + "="*70)
    print("PHASE 2: Fine-Tuning Entire Model")
    print("="*70 + "\n")
    
    # Unfreeze base model
    model = unfreeze_model(model, base_model)
    
    # Recompile with lower learning rate
    fine_tune_lr = config['training']['initial_lr'] / 10
    model = compile_model(model, learning_rate=fine_tune_lr)
    
    # Continue training
    history = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=epochs,
        class_weight=class_weights,
        callbacks=get_callbacks(),
        verbose=1
    )
    
    return history


def main(args):
    """Main training pipeline"""
    
    print("\n" + "="*70)
    print(f"Plant Health Monitoring - Training Pipeline")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70 + "\n")
    
    # Set random seeds for reproducibility
    tf.random.set_seed(config['data']['random_seed'])
    np.random.seed(config['data']['random_seed'])
    
    # Calculate class weights for imbalanced data
    class_weights = calculate_class_weights() if not args.no_class_weights else None
    
    # Enable mixed precision if specified
    use_mixed_precision = config['training']['use_mixed_precision'] and not args.no_mixed_precision
    
    # Build model
    print("■ Building model...")
    model, base_model = build_model(
        model_name=args.model_name,
        num_classes=config['model']['num_classes'],
        pretrained=not args.no_pretrained
    )
    
    model = compile_model(model, use_mixed_precision=use_mixed_precision)
    print_model_summary(model)
    
    # Load data generators
    print("■ Loading data generators...")
    train_gen, val_gen, test_gen = get_data_generators(
        batch_size=config['training']['batch_size']
    )
    
    print(f"  Train batches: {len(train_gen)} (≈{len(train_gen) * config['training']['batch_size']} samples)")
    print(f"  Val batches: {len(val_gen)} (≈{len(val_gen) * config['training']['batch_size']} samples)")
    print(f"  Test batches: {len(test_gen)} (≈{len(test_gen) * config['training']['batch_size']} samples)")
    
    # Training Phase 1: Train head only
    if not args.skip_phase1:
        history1 = train_phase_1(
            model, 
            train_gen, 
            val_gen,
            class_weights=class_weights,
            epochs=args.phase1_epochs
        )
        
        # Save phase 1 model
        model.save(f"{config['paths']['models']}/model_phase1.keras")
        print(f"\n✓ Phase 1 model saved")
    
    # Training Phase 2: Fine-tune entire model
    if not args.skip_phase2:
        history2 = train_phase_2(
            model,
            base_model,
            train_gen,
            val_gen,
            class_weights=class_weights,
            epochs=args.phase2_epochs
        )
        
        # Save final model
        model.save(f"{config['paths']['models']}/model_final.keras")
        print(f"\n✓ Final model saved")
    
    # Evaluate on test set
    print("\n" + "="*70)
    print("FINAL EVALUATION ON TEST SET")
    print("="*70 + "\n")
    
    test_loss, test_acc, test_top2 = model.evaluate(test_gen, verbose=1)
    
    print(f"\n■ Test Results:")
    print(f"  Loss: {test_loss:.4f}")
    print(f"  Accuracy: {test_acc*100:.2f}%")
    print(f"  Top-2 Accuracy: {test_top2*100:.2f}%")
    
    # Save test results
    with open(f"{config['paths']['logs']}/test_results.txt", 'w') as f:
        f.write(f"Test Loss: {test_loss:.4f}\n")
        f.write(f"Test Accuracy: {test_acc:.4f} ({test_acc*100:.2f}%)\n")
        f.write(f"Test Top-2 Accuracy: {test_top2:.4f} ({test_top2*100:.2f}%)\n")
        f.write(f"\nModel: {args.model_name}\n")
        f.write(f"Training completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    print("\n" + "="*70)
    print("✓ Training completed successfully!")
    print(f"Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    print("\nNext steps:")
    print("  1. Run: python evaluate.py")
    print("  2. Test predictions: python inference.py path/to/image.jpg --explain")
    print("  3. Visualize: python explainability.py path/to/image.jpg --all_classes")
    print("="*70 + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Train Plant Health Monitoring Model')
    
    parser.add_argument('--model_name', type=str, 
                       default=config['model']['name'],
                       choices=['efficientnetv2_b2', 'convnext_tiny'],
                       help='Model architecture to use')
    
    parser.add_argument('--phase1_epochs', type=int, default=20,
                       help='Number of epochs for phase 1 (head only)')
    
    parser.add_argument('--phase2_epochs', type=int, default=80,
                       help='Number of epochs for phase 2 (fine-tuning)')
    
    parser.add_argument('--skip_phase1', action='store_true',
                       help='Skip phase 1 training')
    
    parser.add_argument('--skip_phase2', action='store_true',
                       help='Skip phase 2 training')
    
    parser.add_argument('--no_pretrained', action='store_true',
                       help='Train from scratch without ImageNet weights')
    
    parser.add_argument('--no_mixed_precision', action='store_true',
                       help='Disable mixed precision training')
    
    parser.add_argument('--no_class_weights', action='store_true',
                       help='Disable class weights (for balanced datasets)')
    
    args = parser.parse_args()
    
    main(args)