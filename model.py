import yaml
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, Model
from tensorflow.keras.applications import (
    EfficientNetV2B2,
    ConvNeXtTiny,
)

# Load configuration
with open('config.yaml', 'r') as f:
    config = yaml.safe_load(f)


def build_model(model_name=None, num_classes=None, pretrained=True):
    """
    Build and compile the classification model
    
    Args:
        model_name: Model architecture to use
        num_classes: Number of output classes
        pretrained: Use ImageNet pretrained weights
    
    Returns:
        Compiled Keras model
    """
    if model_name is None:
        model_name = config['model']['name']
    
    if num_classes is None:
        num_classes = config['model']['num_classes']
    
    img_size = config['image']['size']
    dropout = config['model']['dropout']
    
    # Input layer
    inputs = layers.Input(shape=(img_size, img_size, 3))
    
    # Select base model
    if model_name == 'efficientnetv2_b2':
        base_model = EfficientNetV2B2(
            include_top=False,
            weights='imagenet' if pretrained else None,
            input_tensor=inputs,
            pooling='avg'
        )
    elif model_name == 'convnext_tiny':
        base_model = ConvNeXtTiny(
            include_top=False,
            weights='imagenet' if pretrained else None,
            input_tensor=inputs,
            pooling='avg'
        )
    else:
        raise ValueError(f"Unknown model: {model_name}")
    
    # Classification head
    x = base_model.output
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(dropout)(x)
    x = layers.Dense(512, activation='relu', 
                     kernel_regularizer=keras.regularizers.l2(0.001))(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(dropout / 2)(x)
    x = layers.Dense(256, activation='relu',
                     kernel_regularizer=keras.regularizers.l2(0.001))(x)
    x = layers.Dropout(dropout / 2)(x)
    outputs = layers.Dense(num_classes, activation='softmax')(x)
    
    # Create model
    model = Model(inputs=inputs, outputs=outputs, name=f'plant_health_{model_name}')
    
    # Freeze base model initially
    base_model.trainable = False
    
    return model, base_model


def unfreeze_model(model, base_model, num_layers=None):
    """
    Unfreeze the last N layers of the base model for fine-tuning
    
    Args:
        model: Full model
        base_model: Base model to unfreeze
        num_layers: Number of layers to unfreeze (from the end)
    """
    if num_layers is None:
        num_layers = config['model']['unfreeze_layers']
    
    # Unfreeze the base model
    base_model.trainable = True
    
    # Freeze all layers except the last num_layers
    total_layers = len(base_model.layers)
    freeze_until = max(0, total_layers - num_layers)
    
    for layer in base_model.layers[:freeze_until]:
        layer.trainable = False
    
    print(f"■ Unfroze last {num_layers} layers of base model")
    print(f"  Total layers: {total_layers}")
    print(f"  Trainable layers: {sum(1 for l in base_model.layers if l.trainable)}")
    print(f"  Frozen layers: {sum(1 for l in base_model.layers if not l.trainable)}")
    
    return model


def compile_model(model, learning_rate=None, use_mixed_precision=False):
    """
    Compile model with optimizer, loss, and metrics
    
    Args:
        model: Keras model to compile
        learning_rate: Initial learning rate
        use_mixed_precision: Use mixed precision training
    """
    if learning_rate is None:
        learning_rate = config['training']['initial_lr']
    
    # Enable mixed precision if specified
    if use_mixed_precision:
        policy = keras.mixed_precision.Policy('mixed_float16')
        keras.mixed_precision.set_global_policy(policy)
        print("■ Mixed precision training enabled")
    
    # Optimizer
    optimizer = keras.optimizers.Adam(learning_rate=learning_rate)
    
    # Loss function
    loss = keras.losses.SparseCategoricalCrossentropy(from_logits=False)
    
    # Metrics
    metrics = [
        keras.metrics.SparseCategoricalAccuracy(name='accuracy'),
        keras.metrics.SparseTopKCategoricalAccuracy(k=2, name='top_2_accuracy')
    ]
    
    model.compile(
        optimizer=optimizer,
        loss=loss,
        metrics=metrics
    )
    
    return model


def get_callbacks(patience=None):
    """
    Create training callbacks
    
    Args:
        patience: Early stopping patience
    
    Returns:
        List of Keras callbacks
    """
    if patience is None:
        patience = config['training']['patience']
    
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
        
        # Early stopping
        keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=patience,
            restore_best_weights=True,
            verbose=1
        ),
        
        # Reduce learning rate on plateau
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=patience // 2,
            min_lr=config['training']['min_lr'],
            verbose=1
        ),
        
        # TensorBoard logging
        keras.callbacks.TensorBoard(
            log_dir=logs_dir,
            histogram_freq=1,
            write_graph=True
        ),
        
        # CSV logger
        keras.callbacks.CSVLogger(
            f"{logs_dir}/training_log.csv",
            append=True
        )
    ]
    
    return callbacks


def print_model_summary(model):
    """Print detailed model information"""
    print("\n" + "="*70)
    print("MODEL SUMMARY")
    print("="*70)
    
    model.summary()
    
    total_params = model.count_params()
    trainable_params = sum([tf.size(w).numpy() for w in model.trainable_weights])
    
    print(f"\n■ Total parameters: {total_params:,}")
    print(f"■ Trainable parameters: {trainable_params:,}")
    print(f"■ Non-trainable parameters: {total_params - trainable_params:,}")
    print("="*70 + "\n")


if __name__ == "__main__":
    # Test model building
    print("Building model...")
    
    model, base_model = build_model()
    model = compile_model(model)
    
    print_model_summary(model)
    
    print("\n✓ Model built successfully!")