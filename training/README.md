# Leafora – Intelligence for Every Leaf

>Leafora is an AI-powered plant health monitoring system designed to classify leaf images into eight distinct categories. It enables early identification of plant health issues, supporting timely intervention and improved crop management decisions. The system is built for real-world usage and is robust to diverse image conditions while maintaining reliable and consistent predictions.

---

## Overview

Leafora classifies plant images into the following categories:

1. Healthy  
2. Pest_Fungal  
3. Pest_Bacterial  
4. Pest_Insect  
5. Nutrient_Nitrogen  
6. Nutrient_Potassium  
7. Water_Stress  
8. Not_Plant  

The project implements advanced deep learning training strategies, production-ready evaluation tools, and a complete end-to-end pipeline from data preparation to inference.

---

## Features

### Classification Categories

- **Healthy** – Normal, healthy plant tissue  
- **Pest_Fungal** – Fungal infections such as powdery mildew, rust, and leaf spots  
- **Pest_Bacterial** – Bacterial diseases including water-soaked lesions and wilting  
- **Pest_Insect** – Insect damage such as holes, chewed edges, or visible pests  
- **Nutrient_Nitrogen** – Nitrogen deficiency symptoms  
- **Nutrient_Potassium** – Potassium deficiency symptoms  
- **Water_Stress** – Indicators of water stress such as wilting or curling  
- **Not_Plant** – Non-plant images (animals, objects, backgrounds)

### Advanced Training Capabilities

- Two-phase transfer learning strategy  
- Focal Loss for handling severe class imbalance  
- Adaptive class weighting with capping mechanism  
- Weighted random sampling  
- Mixup augmentation  
- Comprehensive data augmentation pipeline  

### Production-Ready Features

- Confidence calibration for reliable predictions  
- Extensive evaluation metrics and visualizations  
- Automated data preprocessing and dataset splitting  
- CSV logging of training metrics  
- Easy-to-use inference API  
- System verification utilities  

---

## Project Structure

leafora-plant-health/
│
├── README.md # This file
├── requirements.txt # Python dependencies
├── config.yaml # Configuration file
├── .gitignore # Git ignore file
│
├── data/ # Data directory
│ ├── raw/ # Original images (YOU CREATE THIS)
│ │ ├── Healthy/
│ │ │ ├── image_001.jpg
│ │ │ └── ...
│ │ ├── Pest_Fungal/
│ │ ├── Pest_Bacterial/
│ │ ├── Pest_Insect/
│ │ ├── Nutrient_Nitrogen/
│ │ ├── Nutrient_Potassium/
│ │ ├── Water_Stress/
│ │ └── Not_Plant/
│ │
│ ├── processed/ # Preprocessed images (AUTO-GENERATED)
│ │ ├── Healthy/
│ │ ├── Pest_Fungal/
│ │ ├── Pest_Bacterial/
│ │ ├── Pest_Insect/
│ │ ├── Nutrient_Nitrogen/
│ │ ├── Nutrient_Potassium/
│ │ ├── Water_Stress/
│ │ └── Not_Plant/
│ │
│ └── splits/ # Train/Val/Test splits (AUTO-GENERATED)
│ ├── train.txt
│ ├── val.txt
│ └── test.txt
│
├── saved_models/ # Trained models (AUTO-GENERATED)
│ ├── best_model_phase1.pth
│ ├── best_model.pth
│ ├── model_final.pth
│ └── calibrated_model.pth
│
├── logs/ # Training logs (AUTO-GENERATED)
│ ├── training_phase1.csv
│ ├── training_phase2.csv
│ └── calibrated_results.txt
│
├── outputs/ # Evaluation outputs (AUTO-GENERATED)
│ ├── dataset_distribution.png
│ ├── confusion_matrix.png
│ ├── per_class_metrics.png
│ ├── roc_curves.png
│ ├── confidence_distribution.png
│ ├── evaluation_report.txt
│ ├── training_visualization.png
│ ├── phase_comparison.png
│ ├── learning_rate_schedule.png
│ ├── calibration_reliability_diagram.png
│ ├── calibration_confidence_histograms.png
│ └── calibration_report.txt
│
├── analyze_dataset.py
├── augment_minority_classes.py
├── preprocessing.py
├── data_loader.py
├── model.py
├── train.py
├── evaluate.py
├── inference.py
├── calibrate_confidence.py
├── visualize_training.py
└── verify_system.py



---

## System Requirements

### Hardware

- GPU: NVIDIA GPU with CUDA support (recommended)  
- RAM: 16 GB minimum, 32 GB recommended  
- Storage: 10 GB free space  

### Software

- Python 3.8 or higher  
- CUDA 11.x or 12.x (for GPU acceleration)  
- Git  

---

## Installation

### Step 1: Clone Repository

```bash
git clone https://github.com/TanishRadhakrishna/Plant-Health-monitoring-Internship.git
cd Plant-Health-monitoring-Internship/training
```



### Step 2: Create Virtual Environment

Create a virtual environment to isolate project dependencies.

> python -m venv venv

Activate the virtual environment:

# Linux / macOS
source venv/bin/activate

# Windows
> venv\Scripts\activate

### Step 3: Install Dependencies

Install PyTorch according to your CUDA version.
Example shown for CUDA 12.1.

> pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121


Install remaining dependencies:

> pip install -r requirements.txt

### Step 4: Verify Installation

Verify that the system and environment are correctly configured.

> python verify_system.py


This script checks CUDA availability, PyTorch installation, and required dependencies.

## Configuration Files

> The project uses two primary configuration files: requirements.txt and config.yaml.

### requirements.txt

> Contains all required Python dependencies including PyTorch, timm, OpenCV, albumentations, scikit-learn, and visualization libraries.

torch==2.1.2+cu121
torchvision==0.16.2+cu121
torchaudio==2.1.2
timm==0.9.16
opencv-python==4.9.0.80
opencv-contrib-python==4.9.0.80
Pillow==10.2.0
albumentations==1.4.0
numpy==1.24.4
pandas==2.1.4
scikit-learn==1.3.2
matplotlib==3.8.2
seaborn==0.13.1
tqdm==4.66.1
PyYAML==6.0.1
scipy==1.11.4
imageio==2.33.1

### config.yaml

> Defines the model architecture, training parameters, augmentation settings, dataset splits, class definitions, and evaluation metrics.

model:
  name: efficientnet_b2
  pretrained: true
  num_classes: 8
  dropout: 0.2

image:
  size: 224
  channels: 3

data:
  train_split: 0.8
  val_split: 0.1
  test_split: 0.1

training:
  batch_size: 16
  epochs: 200
  initial_lr: 0.0003
  use_focal_loss: true
  focal_gamma: 1.5

classes:
  - Healthy
  - Pest_Fungal
  - Pest_Bacterial
  - Pest_Insect
  - Nutrient_Nitrogen
  - Nutrient_Potassium
  - Water_Stress
  - Not_Plant

## Dataset Preparation
### Recommended Dataset Size
Class	Recommended Samples
Healthy	1000+
Pest_Fungal	1000+
Pest_Bacterial	1000+
Pest_Insect	500+
Nutrient_Nitrogen	500+
Nutrient_Potassium	500+
Water_Stress	500+
Not_Plant	400+

### Directory Setup

Create the required dataset directory structure:

> mkdir -p data/raw/{Healthy,Pest_Fungal,Pest_Bacterial,Pest_Insect,Nutrient_Nitrogen,Nutrient_Potassium,Water_Stress,Not_Plant}


Add images to the corresponding class folders.

### Image Requirements

Formats: JPG, JPEG, PNG

Resolution: Any (automatically resized to 224×224)

Lighting: Diverse lighting conditions recommended

## Quick Start

> Run the complete pipeline:

python verify_system.py
python analyze_dataset.py
python preprocessing.py
python train.py
python inference.py path/to/image.jpg --explain

## Training Workflow
### Two-Phase Transfer Learning

Phase 1

Backbone frozen

Higher learning rate

Train classification head

Phase 2

Entire model unfrozen

Lower learning rate

Fine-grained feature tuning

Saved artifacts include trained models, logs, and evaluation outputs.

## Evaluation and Calibration

Run model evaluation and confidence calibration:

>python evaluate.py
 python calibrate_confidence.py


Generated outputs include confusion matrices, per-class metrics, ROC curves, and confidence analysis.

## Inference
python inference.py path/to/image.jpg
python inference.py path/to/image.jpg --explain
python inference.py path/to/image.jpg --save
