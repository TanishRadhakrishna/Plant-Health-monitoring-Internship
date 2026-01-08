import os
import cv2
import yaml
import numpy as np
import albumentations as A
from tensorflow.keras.utils import Sequence

# Load configuration
with open('config.yaml', 'r') as f:
    config = yaml.safe_load(f)


class PlantDataGenerator(Sequence):
    """
    Custom data generator with strong augmentation using Albumentations
    """
    
    def __init__(self, split_file, batch_size=32, shuffle=True, augment=True):
        self.batch_size = batch_size
        self.shuffle = shuffle
        self.augment = augment
        
        self.img_size = config['image']['size']
        self.processed_dir = config['paths']['processed_data']
        
        # Label mapping
        self.label_map = {cls: idx for idx, cls in enumerate(config['classes'])}
        
        # Load image paths and labels
        self.data = []
        with open(split_file, 'r') as f:
            for line in f:
                cls, img_name = line.strip().split('/')
                img_path = os.path.join(self.processed_dir, cls, img_name)
                self.data.append((img_path, self.label_map[cls]))
        
        self.indexes = np.arange(len(self.data))
        
        if self.shuffle:
            np.random.shuffle(self.indexes)
        
        # Define augmentation pipeline
        self.transform = self._get_transforms()
    
    def _get_transforms(self):
        """
        Define augmentation pipeline using Albumentations
        """
        if not self.augment:
            return A.Compose([
                A.Normalize(
                    mean=config['image']['normalize_mean'],
                    std=config['image']['normalize_std']
                )
            ])
        
        aug_config = config['augmentation']
        
        return A.Compose([
            # Geometric transformations
            A.HorizontalFlip(p=0.5 if aug_config['horizontal_flip'] else 0),
            A.VerticalFlip(p=0.5 if aug_config['vertical_flip'] else 0),
            A.Rotate(
                limit=aug_config['rotation_range'],
                border_mode=cv2.BORDER_REFLECT,
                p=0.7
            ),
            A.ShiftScaleRotate(
                shift_limit=aug_config['width_shift'],
                scale_limit=aug_config['zoom_range'],
                rotate_limit=0,
                border_mode=cv2.BORDER_REFLECT,
                p=0.7
            ),
            
            # Color augmentations
            A.RandomBrightnessContrast(
                brightness_limit=0.3,
                contrast_limit=0.3,
                p=0.5
            ),
            A.HueSaturationValue(
                hue_shift_limit=20,
                sat_shift_limit=30,
                val_shift_limit=20,
                p=0.5
            ),
            
            # Blur and noise
            A.OneOf([
                A.GaussianBlur(blur_limit=(3, 5), p=1),
                A.MedianBlur(blur_limit=5, p=1),
            ], p=0.3),
            
            A.OneOf([
                A.GaussNoise(var_limit=(10, 50), p=1),
                A.ISONoise(color_shift=(0.01, 0.05), intensity=(0.1, 0.5), p=1),
            ], p=0.2),
            
            # Weather effects (realistic outdoor conditions)
            A.RandomShadow(
                shadow_roi=(0, 0.5, 1, 1),
                num_shadows_lower=1,
                num_shadows_upper=2,
                shadow_dimension=5,
                p=0.3
            ),
            
            # Normalize
            A.Normalize(
                mean=config['image']['normalize_mean'],
                std=config['image']['normalize_std']
            )
        ])
    
    def __len__(self):
        """Number of batches per epoch"""
        return int(np.ceil(len(self.data) / self.batch_size))
    
    def __getitem__(self, index):
        """Generate one batch of data"""
        batch_indexes = self.indexes[
            index * self.batch_size:(index + 1) * self.batch_size
        ]
        
        batch_data = [self.data[i] for i in batch_indexes]
        
        X, y = self._generate_batch(batch_data)
        
        return X, y
    
    def _generate_batch(self, batch_data):
        """Generate batch of augmented images"""
        X = np.empty((len(batch_data), self.img_size, self.img_size, 3), 
                     dtype=np.float32)
        y = np.empty(len(batch_data), dtype=np.int32)
        
        for i, (img_path, label) in enumerate(batch_data):
            # Load image
            img = cv2.imread(img_path)
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # Apply augmentations
            augmented = self.transform(image=img)
            X[i] = augmented['image']
            y[i] = label
        
        return X, y
    
    def on_epoch_end(self):
        """Shuffle data after each epoch"""
        if self.shuffle:
            np.random.shuffle(self.indexes)


def get_data_generators(batch_size=32):
    """
    Create data generators for train, validation, and test sets
    """
    splits_dir = config['paths']['splits']
    
    train_gen = PlantDataGenerator(
        split_file=os.path.join(splits_dir, 'train.txt'),
        batch_size=batch_size,
        shuffle=True,
        augment=True
    )
    
    val_gen = PlantDataGenerator(
        split_file=os.path.join(splits_dir, 'val.txt'),
        batch_size=batch_size,
        shuffle=False,
        augment=False
    )
    
    test_gen = PlantDataGenerator(
        split_file=os.path.join(splits_dir, 'test.txt'),
        batch_size=batch_size,
        shuffle=False,
        augment=False
    )
    
    return train_gen, val_gen, test_gen


if __name__ == "__main__":
    # Test the data generator
    print("Testing data generator...")
    
    train_gen, val_gen, test_gen = get_data_generators(batch_size=4)
    
    print(f"Train batches: {len(train_gen)}")
    print(f"Val batches: {len(val_gen)}")
    print(f"Test batches: {len(test_gen)}")
    
    # Get one batch
    X_batch, y_batch = train_gen[0]
    print(f"\nBatch shape: {X_batch.shape}")
    print(f"Labels shape: {y_batch.shape}")
    print(f"Pixel range: [{X_batch.min():.2f}, {X_batch.max():.2f}]")
    print("\n✓ Data generator working correctly!")