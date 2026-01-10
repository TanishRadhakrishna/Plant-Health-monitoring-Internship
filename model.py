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
    Build and compile the classification model with enhanced architecture
    
    Args:
        model_name: Model architecture to use
        num_classes: Number of output classes
        pretrained: Use ImageNet pretrained weights
    
    Returns:
        Compiled Keras model, base_model
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
    
    # Enhanced classification head for higher accuracy
    x = base_model.output
    
    # First dense block
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(dropout)(x)
    x = layers.Dense(512, activation='relu', 
                     kernel_regularizer=keras.regularizers.l2(0.001),
                     name='dense_512')(x)
    
    # Second dense block
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(dropout / 2)(x)
    x = layers.Dense(256, activation='relu',
                     kernel_regularizer=keras.regularizers.l2(0.001),
                     name='dense_256')(x)
    
    # Third dense block for better feature separation
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(dropout / 3)(x)
    x = layers.Dense(128, activation='relu',
                     kernel_regularizer=keras.regularizers.l2(0.001),
                     name='dense_128')(x)
    
    # Output layer
    x = layers.Dropout(dropout / 4)(x)
    outputs = layers.Dense(num_classes, activation='softmax', name='predictions')(x)
    
    # Create model
    model = Model(inputs=inputs, outputs=outputs, name=f'plant_health_{model_name}')
    
    # Freeze base model initially
    base_model.trainable = False
    
    print(f"\n✓ Model architecture: {model_name}")
    print(f"✓ Pretrained weights: {'ImageNet' if pretrained else 'Random initialization'}")
    print(f"✓ Number of classes: {num_classes}")
    
    return model, base_model


def unfreeze_model(model, base_model, num_layers=None):
    """
    Unfreeze the last N layers of the base model for fine-tuning
    
    Args:
        model: Full model
        base_model: Base model to unfreeze
        num_layers: Number of layers to unfreeze (from the end)
    
    Returns:
        Model with unfrozen layers
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
    
    trainable_count = sum(1 for l in base_model.layers if l.trainable)
    frozen_count = sum(1 for l in base_model.layers if not l.trainable)
    
    print(f"\n■ Base Model Unfreezing:")
    print(f" Total layers: {total_layers}")
    print(f" Trainable layers: {trainable_count}")
    print(f" Frozen layers: {frozen_count}")
    print(f" Unfroze last {num_layers} layers")
    
    return model


def compile_model(model, learning_rate=None, use_mixed_precision=False):
    """
    Compile model with optimizer, loss, and metrics optimized for high accuracy
    
    Args:
        model: Keras model to compile
        learning_rate: Initial learning rate
        use_mixed_precision: Use mixed precision training
    
    Returns:
        Compiled model
    """
    if learning_rate is None:
        learning_rate = config['training']['initial_lr']
    
    # Enable mixed precision if specified
    if use_mixed_precision:
        policy = keras.mixed_precision.Policy('mixed_float16')
        keras.mixed_precision.set_global_policy(policy)
        print("\n✓ Mixed precision training enabled (faster training, lower memory)")
    
    # Optimizer with gradient clipping for stability
    optimizer = keras.optimizers.Adam(
        learning_rate=learning_rate,
        clipnorm=config['training']['gradient_clip']
    )
    
    # Loss function
    loss = keras.losses.SparseCategoricalCrossentropy(from_logits=False)
    
    # Comprehensive metrics for tracking performance
    metrics = [
        keras.metrics.SparseCategoricalAccuracy(name='accuracy'),
        keras.metrics.SparseTopKCategoricalAccuracy(k=2, name='top_2_accuracy'),
        keras.metrics.SparseTopKCategoricalAccuracy(k=3, name='top_3_accuracy')
    ]
    
    model.compile(
        optimizer=optimizer,
        loss=loss,
        metrics=metrics
    )
    
    print(f"✓ Model compiled with learning rate: {learning_rate}")
    
    return model


def print_model_summary(model):
    """Print detailed model information"""
    print("\n" + "="*70)
    print("MODEL SUMMARY")
    print("="*70)
    
    model.summary()
    
    total_params = model.count_params()
    trainable_params = sum([tf.size(w).numpy() for w in model.trainable_weights])
    
    print(f"\n■ Parameter Statistics:")
    print(f" Total parameters: {total_params:,}")
    print(f" Trainable parameters: {trainable_params:,}")
    print(f" Non-trainable parameters: {total_params - trainable_params:,}")
    print(f" Trainable %: {trainable_params/total_params*100:.2f}%")
    print("="*70 + "\n")


if __name__ == "__main__":
    # Test model building
    print("Building model...")
    
    model, base_model = build_model()
    model = compile_model(model)
    
    print_model_summary(model)
    
    print("\n✓ Model built successfully!")
    print("✓ Ready for training with high accuracy configuration")