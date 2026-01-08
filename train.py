import os
import yaml
import argparse
import numpy as np
import tensorflow as tf
from datetime import datetime
from collections import Counter
from tensorflow import keras

from model import (
    build_model, 
    compile_model, 
    unfreeze_model,
    print_model_summary
)
from data_generator import get_data_generators

# Load configuration
with open('config.yaml', 'r') as f:
    config = yaml.safe_load(f)

# Create necessary directories
os.makedirs(config['paths']['models'], exist_ok=True)
os.makedirs(config['paths']['logs'], exist_ok=True)


class PhaseTransitionCallback(keras.callbacks.Callback):
    """
    Custom callback to automatically transition from Phase 1 to Phase 2
    when validation accuracy plateaus for 5 consecutive epochs
    """
    
    def __init__(self, patience=5, monitor='val_accuracy'):
        super().__init__()
        self.patience = patience
        self.monitor = monitor
        self.best_value = -np.Inf
        self.wait = 0
        self.should_transition = False
        
    def on_epoch_end(self, epoch, logs=None):
        current = logs.get(self.monitor)
        
        if current is None:
            return
        
        # Check if there's improvement
        if current > self.best_value:
            self.best_value = current
            self.wait = 0
            print(f"\n✓ New best {self.monitor}: {current:.4f}")
        else:
            self.wait += 1
            print(f"\n⚠ No improvement for {self.wait}/{self.patience} epochs")
            
            if self.wait >= self.patience:
                print(f"\n{'='*70}")
                print(f"■ PLATEAU DETECTED: No improvement in {self.monitor} for {self.patience} epochs")
                print(f"■ TRIGGERING PHASE 2: Fine-tuning entire model")
                print(f"{'='*70}\n")
                self.should_transition = True
                self.model.stop_training = True


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
        print("■ Significant class imbalance detected - using class weights\n")
        return class_weights
    else:
        print("✓ Classes relatively balanced - no weights needed\n")
        return None


def get_phase1_callbacks(transition_callback):
    """
    Callbacks for Phase 1 training
    Focus on plateau detection and best model saving
    """
    models_dir = config['paths']['models']
    logs_dir = config['paths']['logs']
    
    callbacks = [
        # Phase transition callback (triggers after 5 epochs without improvement)
        transition_callback,
        
        # Model checkpoint - save best model based on validation accuracy
        keras.callbacks.ModelCheckpoint(
            filepath=f"{models_dir}/best_model_phase1.keras",
            monitor='val_accuracy',
            mode='max',
            save_best_only=True,
            verbose=1
        ),
        
        # Reduce learning rate on plateau (faster than transition)
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_accuracy',
            mode='max',
            factor=0.5,
            patience=3,
            min_lr=config['training']['min_lr'],
            verbose=1
        ),
        
        # TensorBoard logging
        keras.callbacks.TensorBoard(
            log_dir=f"{logs_dir}/phase1",
            histogram_freq=1,
            write_graph=True
        ),
        
        # CSV logger
        keras.callbacks.CSVLogger(
            f"{logs_dir}/training_phase1.csv",
            append=False
        )
    ]
    
    return callbacks


def get_phase2_callbacks():
    """
    Callbacks for Phase 2 training
    Focus on achieving maximum accuracy with early stopping
    """
    models_dir = config['paths']['models']
    logs_dir = config['paths']['logs']
    
    callbacks = [
        # Model checkpoint - save best model
        keras.callbacks.ModelCheckpoint(
            filepath=f"{models_dir}/best_model.keras",
            monitor='val_accuracy',
            mode='max',
            save_best_only=True,
            verbose=1
        ),
        
        # Early stopping - stop if no improvement for 15 epochs
        keras.callbacks.EarlyStopping(
            monitor='val_accuracy',
            mode='max',
            patience=15,
            restore_best_weights=True,
            verbose=1,
            min_delta=0.001  # Minimum change to qualify as improvement
        ),
        
        # Reduce learning rate on plateau
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_accuracy',
            mode='max',
            factor=0.5,
            patience=7,
            min_lr=config['training']['min_lr'],
            verbose=1,
            min_delta=0.001
        ),
        
        # TensorBoard logging
        keras.callbacks.TensorBoard(
            log_dir=f"{logs_dir}/phase2",
            histogram_freq=1,
            write_graph=True
        ),
        
        # CSV logger
        keras.callbacks.CSVLogger(
            f"{logs_dir}/training_phase2.csv",
            append=False
        )
    ]
    
    return callbacks


def train_with_smart_transition(model, base_model, train_gen, val_gen, class_weights=None, max_epochs_phase1=50, max_epochs_phase2=100):
    """
    Smart training with automatic Phase 1 -> Phase 2 transition
    """
    
    # ==================== PHASE 1 ====================
    print("\n" + "="*70)
    print("PHASE 1: Training Classification Head (Base Model Frozen)")
    print("="*70)
    print("■ Strategy: Train only the classification head")
    print("■ Auto-transition: Will move to Phase 2 after 5 epochs without improvement")
    print("="*70 + "\n")
    
    transition_callback = PhaseTransitionCallback(patience=5, monitor='val_accuracy')
    
    history1 = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=max_epochs_phase1,
        class_weight=class_weights,
        callbacks=get_phase1_callbacks(transition_callback),
        verbose=1
    )
    
    # Save phase 1 model
    model.save(f"{config['paths']['models']}/model_phase1.keras")
    print(f"\n✓ Phase 1 model saved")
    
    # Check if transition is needed
    actual_phase1_epochs = len(history1.history['loss'])
    print(f"\n■ Phase 1 completed after {actual_phase1_epochs} epochs")
    
    if transition_callback.should_transition or actual_phase1_epochs < max_epochs_phase1:
        print(f"■ Best validation accuracy: {transition_callback.best_value:.4f}")
    
    # ==================== PHASE 2 ====================
    print("\n" + "="*70)
    print("PHASE 2: Fine-Tuning Entire Model")
    print("="*70)
    print("■ Strategy: Unfreeze base model and train with lower learning rate")
    print("■ Early stopping: Will stop after 15 epochs without improvement")
    print("="*70 + "\n")
    
    # Unfreeze base model
    model = unfreeze_model(model, base_model)
    
    # Recompile with lower learning rate for fine-tuning
    fine_tune_lr = config['training']['initial_lr'] / 10
    model = compile_model(model, learning_rate=fine_tune_lr)
    
    # Continue training with Phase 2 callbacks
    history2 = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=max_epochs_phase2,
        class_weight=class_weights,
        callbacks=get_phase2_callbacks(),
        verbose=1
    )
    
    # Save final model
    model.save(f"{config['paths']['models']}/model_final.keras")
    print(f"\n✓ Final model saved")
    
    actual_phase2_epochs = len(history2.history['loss'])
    print(f"\n■ Phase 2 completed after {actual_phase2_epochs} epochs")
    
    # Combine histories
    combined_history = {
        'phase1_epochs': actual_phase1_epochs,
        'phase2_epochs': actual_phase2_epochs,
        'total_epochs': actual_phase1_epochs + actual_phase2_epochs,
        'phase1_best_val_acc': max(history1.history.get('val_accuracy', [0])),
        'phase2_best_val_acc': max(history2.history.get('val_accuracy', [0])),
    }
    
    return model, combined_history


def main(args):
    """Main training pipeline with smart phase transitions"""
    
    print("\n" + "="*70)
    print(f"Plant Health Monitoring - High Accuracy Training Pipeline")
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
    
    print(f" Train batches: {len(train_gen)} (≈{len(train_gen) * config['training']['batch_size']} samples)")
    print(f" Val batches: {len(val_gen)} (≈{len(val_gen) * config['training']['batch_size']} samples)")
    print(f" Test batches: {len(test_gen)} (≈{len(test_gen) * config['training']['batch_size']} samples)")
    
    # Smart training with automatic transition
    model, training_summary = train_with_smart_transition(
        model,
        base_model,
        train_gen,
        val_gen,
        class_weights=class_weights,
        max_epochs_phase1=args.max_epochs_phase1,
        max_epochs_phase2=args.max_epochs_phase2
    )
    
    # Evaluate on test set
    print("\n" + "="*70)
    print("FINAL EVALUATION ON TEST SET")
    print("="*70 + "\n")
    
    test_loss, test_acc, test_top2 = model.evaluate(test_gen, verbose=1)
    
    print(f"\n■ Training Summary:")
    print(f" Phase 1 epochs: {training_summary['phase1_epochs']}")
    print(f" Phase 2 epochs: {training_summary['phase2_epochs']}")
    print(f" Total epochs: {training_summary['total_epochs']}")
    print(f" Phase 1 best val accuracy: {training_summary['phase1_best_val_acc']*100:.2f}%")
    print(f" Phase 2 best val accuracy: {training_summary['phase2_best_val_acc']*100:.2f}%")
    
    print(f"\n■ Test Results:")
    print(f" Loss: {test_loss:.4f}")
    print(f" Accuracy: {test_acc*100:.2f}%")
    print(f" Top-2 Accuracy: {test_top2*100:.2f}%")
    
    # Save test results
    with open(f"{config['paths']['logs']}/test_results.txt", 'w') as f:
        f.write("="*70 + "\n")
        f.write("TRAINING SUMMARY\n")
        f.write("="*70 + "\n")
        f.write(f"Phase 1 epochs: {training_summary['phase1_epochs']}\n")
        f.write(f"Phase 2 epochs: {training_summary['phase2_epochs']}\n")
        f.write(f"Total epochs: {training_summary['total_epochs']}\n")
        f.write(f"Phase 1 best val accuracy: {training_summary['phase1_best_val_acc']:.4f} ({training_summary['phase1_best_val_acc']*100:.2f}%)\n")
        f.write(f"Phase 2 best val accuracy: {training_summary['phase2_best_val_acc']:.4f} ({training_summary['phase2_best_val_acc']*100:.2f}%)\n\n")
        f.write("="*70 + "\n")
        f.write("TEST RESULTS\n")
        f.write("="*70 + "\n")
        f.write(f"Test Loss: {test_loss:.4f}\n")
        f.write(f"Test Accuracy: {test_acc:.4f} ({test_acc*100:.2f}%)\n")
        f.write(f"Test Top-2 Accuracy: {test_top2:.4f} ({test_top2*100:.2f}%)\n\n")
        f.write(f"Model: {args.model_name}\n")
        f.write(f"Training completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    print("\n" + "="*70)
    print("✓ Training completed successfully!")
    print(f"Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    print("\nNext steps:")
    print(" 1. Run: python evaluate.py")
    print(" 2. Test predictions: python inference.py path/to/image.jpg --explain")
    print(" 3. Visualize: python explainability.py path/to/image.jpg --all_classes")
    print("="*70 + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Train Plant Health Monitoring Model with High Accuracy')
    
    parser.add_argument('--model_name', type=str, 
                        default=config['model']['name'],
                        choices=['efficientnetv2_b2', 'convnext_tiny'],
                        help='Model architecture to use')
    
    parser.add_argument('--max_epochs_phase1', type=int, default=50,
                        help='Maximum epochs for phase 1 (will stop early if plateau detected)')
    
    parser.add_argument('--max_epochs_phase2', type=int, default=100,
                        help='Maximum epochs for phase 2 (will stop early if no improvement)')
    
    parser.add_argument('--no_pretrained', action='store_true',
                        help='Train from scratch without ImageNet weights')
    
    parser.add_argument('--no_mixed_precision', action='store_true',
                        help='Disable mixed precision training')
    
    parser.add_argument('--no_class_weights', action='store_true',
                        help='Disable class weights (for balanced datasets)')
    
    args = parser.parse_args()
    
    main(args)