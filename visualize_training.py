import os
import yaml
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

# Load configuration
with open('config.yaml', 'r') as f:
    config = yaml.safe_load(f)

# Set style
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (16, 12)
plt.rcParams['font.size'] = 10


def load_training_logs():
    """
    Load training logs from CSV files
    
    Returns:
        phase1_df, phase2_df or None if files don't exist
    """
    logs_dir = config['paths']['logs']
    
    phase1_file = os.path.join(logs_dir, 'training_phase1.csv')
    phase2_file = os.path.join(logs_dir, 'training_phase2.csv')
    
    phase1_df = None
    phase2_df = None
    
    if os.path.exists(phase1_file):
        phase1_df = pd.read_csv(phase1_file)
        phase1_df['phase'] = 'Phase 1'
        print(f"✓ Loaded Phase 1 logs: {len(phase1_df)} epochs")
    else:
        print(f"⚠ Phase 1 log not found: {phase1_file}")
    
    if os.path.exists(phase2_file):
        phase2_df = pd.read_csv(phase2_file)
        phase2_df['phase'] = 'Phase 2'
        # Adjust epoch numbers to continue from Phase 1
        if phase1_df is not None:
            phase2_df['epoch'] = phase2_df['epoch'] + len(phase1_df)
        print(f"✓ Loaded Phase 2 logs: {len(phase2_df)} epochs")
    else:
        print(f"⚠ Phase 2 log not found: {phase2_file}")
    
    return phase1_df, phase2_df


def plot_combined_metrics(phase1_df, phase2_df, save_path=None):
    """
    Create comprehensive training visualization with all metrics
    """
    # Combine dataframes
    if phase1_df is not None and phase2_df is not None:
        df = pd.concat([phase1_df, phase2_df], ignore_index=True)
        title_suffix = "Complete Training (Phase 1 + Phase 2)"
    elif phase1_df is not None:
        df = phase1_df
        title_suffix = "Phase 1 Only"
    elif phase2_df is not None:
        df = phase2_df
        title_suffix = "Phase 2 Only"
    else:
        print("✗ No training logs found!")
        return
    
    # Create subplots
    fig = plt.figure(figsize=(18, 12))
    gs = fig.add_gridspec(3, 2, hspace=0.3, wspace=0.3)
    
    # Color scheme
    train_color = '#2E86AB'
    val_color = '#A23B72'
    phase1_bg = '#E8F4F8'
    phase2_bg = '#FFF4E6'
    
    # ==================== 1. Accuracy Plot ====================
    ax1 = fig.add_subplot(gs[0, 0])
    
    if 'accuracy' in df.columns:
        ax1.plot(df['epoch'], df['accuracy'], 
                label='Training Accuracy', color=train_color, linewidth=2, marker='o', markersize=4)
    if 'val_accuracy' in df.columns:
        ax1.plot(df['epoch'], df['val_accuracy'], 
                label='Validation Accuracy', color=val_color, linewidth=2, marker='s', markersize=4)
    
    # Mark phase transition
    if phase1_df is not None and phase2_df is not None:
        transition_epoch = len(phase1_df)
        ax1.axvline(x=transition_epoch, color='red', linestyle='--', linewidth=2, alpha=0.7, label='Phase Transition')
        ax1.axvspan(0, transition_epoch, alpha=0.1, color='blue')
        ax1.axvspan(transition_epoch, df['epoch'].max(), alpha=0.1, color='orange')
    
    ax1.set_xlabel('Epoch', fontweight='bold')
    ax1.set_ylabel('Accuracy', fontweight='bold')
    ax1.set_title('Training & Validation Accuracy', fontsize=14, fontweight='bold')
    ax1.legend(loc='lower right', framealpha=0.9)
    ax1.grid(True, alpha=0.3)
    ax1.set_ylim([0, 1])
    
    # ==================== 2. Loss Plot ====================
    ax2 = fig.add_subplot(gs[0, 1])
    
    if 'loss' in df.columns:
        ax2.plot(df['epoch'], df['loss'], 
                label='Training Loss', color=train_color, linewidth=2, marker='o', markersize=4)
    if 'val_loss' in df.columns:
        ax2.plot(df['epoch'], df['val_loss'], 
                label='Validation Loss', color=val_color, linewidth=2, marker='s', markersize=4)
    
    # Mark phase transition
    if phase1_df is not None and phase2_df is not None:
        ax2.axvline(x=transition_epoch, color='red', linestyle='--', linewidth=2, alpha=0.7, label='Phase Transition')
        ax2.axvspan(0, transition_epoch, alpha=0.1, color='blue')
        ax2.axvspan(transition_epoch, df['epoch'].max(), alpha=0.1, color='orange')
    
    ax2.set_xlabel('Epoch', fontweight='bold')
    ax2.set_ylabel('Loss', fontweight='bold')
    ax2.set_title('Training & Validation Loss', fontsize=14, fontweight='bold')
    ax2.legend(loc='upper right', framealpha=0.9)
    ax2.grid(True, alpha=0.3)
    
    # ==================== 3. Accuracy Gap (Overfitting Indicator) ====================
    ax3 = fig.add_subplot(gs[1, 0])
    
    if 'accuracy' in df.columns and 'val_accuracy' in df.columns:
        accuracy_gap = df['accuracy'] - df['val_accuracy']
        ax3.plot(df['epoch'], accuracy_gap, 
                color='#E63946', linewidth=2, marker='o', markersize=4)
        ax3.axhline(y=0, color='green', linestyle='-', linewidth=1, alpha=0.5)
        ax3.axhline(y=0.05, color='orange', linestyle='--', linewidth=1, alpha=0.5, label='5% Gap (Acceptable)')
        ax3.axhline(y=0.10, color='red', linestyle='--', linewidth=1, alpha=0.5, label='10% Gap (Overfitting)')
        
        # Mark phase transition
        if phase1_df is not None and phase2_df is not None:
            ax3.axvline(x=transition_epoch, color='red', linestyle='--', linewidth=2, alpha=0.7)
            ax3.axvspan(0, transition_epoch, alpha=0.1, color='blue')
            ax3.axvspan(transition_epoch, df['epoch'].max(), alpha=0.1, color='orange')
    
    ax3.set_xlabel('Epoch', fontweight='bold')
    ax3.set_ylabel('Accuracy Gap', fontweight='bold')
    ax3.set_title('Overfitting Monitor (Train - Val Accuracy)', fontsize=14, fontweight='bold')
    ax3.legend(loc='upper right', framealpha=0.9)
    ax3.grid(True, alpha=0.3)
    
    # ==================== 4. Top-K Accuracy ====================
    ax4 = fig.add_subplot(gs[1, 1])
    
    metrics_to_plot = []
    if 'val_accuracy' in df.columns:
        metrics_to_plot.append(('val_accuracy', 'Top-1 Accuracy', '#2E86AB'))
    if 'val_top_2_accuracy' in df.columns:
        metrics_to_plot.append(('val_top_2_accuracy', 'Top-2 Accuracy', '#A23B72'))
    if 'val_top_3_accuracy' in df.columns:
        metrics_to_plot.append(('val_top_3_accuracy', 'Top-3 Accuracy', '#F77F00'))
    
    for col, label, color in metrics_to_plot:
        ax4.plot(df['epoch'], df[col], label=label, color=color, linewidth=2, marker='o', markersize=4)
    
    # Mark phase transition
    if phase1_df is not None and phase2_df is not None:
        ax4.axvline(x=transition_epoch, color='red', linestyle='--', linewidth=2, alpha=0.7)
        ax4.axvspan(0, transition_epoch, alpha=0.1, color='blue')
        ax4.axvspan(transition_epoch, df['epoch'].max(), alpha=0.1, color='orange')
    
    ax4.set_xlabel('Epoch', fontweight='bold')
    ax4.set_ylabel('Accuracy', fontweight='bold')
    ax4.set_title('Validation Top-K Accuracy Comparison', fontsize=14, fontweight='bold')
    ax4.legend(loc='lower right', framealpha=0.9)
    ax4.grid(True, alpha=0.3)
    ax4.set_ylim([0, 1])
    
    # ==================== 5. Learning Rate ====================
    ax5 = fig.add_subplot(gs[2, 0])
    
    if 'lr' in df.columns:
        ax5.plot(df['epoch'], df['lr'], 
                color='#06A77D', linewidth=2, marker='o', markersize=4)
        ax5.set_yscale('log')
        
        # Mark phase transition
        if phase1_df is not None and phase2_df is not None:
            ax5.axvline(x=transition_epoch, color='red', linestyle='--', linewidth=2, alpha=0.7, label='Phase Transition')
            ax5.axvspan(0, transition_epoch, alpha=0.1, color='blue')
            ax5.axvspan(transition_epoch, df['epoch'].max(), alpha=0.1, color='orange')
    
    ax5.set_xlabel('Epoch', fontweight='bold')
    ax5.set_ylabel('Learning Rate (log scale)', fontweight='bold')
    ax5.set_title('Learning Rate Schedule', fontsize=14, fontweight='bold')
    ax5.legend(loc='upper right', framealpha=0.9)
    ax5.grid(True, alpha=0.3, which='both')
    
    # ==================== 6. Training Summary Stats ====================
    ax6 = fig.add_subplot(gs[2, 1])
    ax6.axis('off')
    
    # Calculate statistics
    summary_text = []
    summary_text.append("=" * 50)
    summary_text.append("TRAINING SUMMARY")
    summary_text.append("=" * 50)
    
    if phase1_df is not None:
        summary_text.append(f"\n■ Phase 1:")
        summary_text.append(f"  Epochs: {len(phase1_df)}")
        if 'val_accuracy' in phase1_df.columns:
            best_phase1_acc = phase1_df['val_accuracy'].max()
            summary_text.append(f"  Best Val Accuracy: {best_phase1_acc:.4f} ({best_phase1_acc*100:.2f}%)")
    
    if phase2_df is not None:
        summary_text.append(f"\n■ Phase 2:")
        summary_text.append(f"  Epochs: {len(phase2_df)}")
        if 'val_accuracy' in phase2_df.columns:
            best_phase2_acc = phase2_df['val_accuracy'].max()
            summary_text.append(f"  Best Val Accuracy: {best_phase2_acc:.4f} ({best_phase2_acc*100:.2f}%)")
    
    summary_text.append(f"\n■ Overall:")
    summary_text.append(f"  Total Epochs: {len(df)}")
    
    if 'val_accuracy' in df.columns:
        best_overall_acc = df['val_accuracy'].max()
        best_epoch = df.loc[df['val_accuracy'].idxmax(), 'epoch']
        summary_text.append(f"  Best Val Accuracy: {best_overall_acc:.4f} ({best_overall_acc*100:.2f}%)")
        summary_text.append(f"  Best Epoch: {int(best_epoch)}")
    
    if 'val_loss' in df.columns:
        best_loss = df['val_loss'].min()
        summary_text.append(f"  Best Val Loss: {best_loss:.4f}")
    
    if 'accuracy' in df.columns and 'val_accuracy' in df.columns:
        final_gap = df.iloc[-1]['accuracy'] - df.iloc[-1]['val_accuracy']
        summary_text.append(f"\n■ Final Accuracy Gap: {final_gap:.4f} ({final_gap*100:.2f}%)")
        if final_gap < 0.05:
            summary_text.append("  Status: ✓ Excellent (No overfitting)")
        elif final_gap < 0.10:
            summary_text.append("  Status: ⚠ Good (Slight overfitting)")
        else:
            summary_text.append("  Status: ⚠ Overfitting detected")
    
    if 'lr' in df.columns:
        final_lr = df.iloc[-1]['lr']
        summary_text.append(f"\n■ Final Learning Rate: {final_lr:.6f}")
    
    summary_text.append("\n" + "=" * 50)
    
    # Display text
    ax6.text(0.05, 0.95, '\n'.join(summary_text), 
            transform=ax6.transAxes,
            fontsize=11,
            verticalalignment='top',
            fontfamily='monospace',
            bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.3))
    
    # Overall title
    fig.suptitle(f'Plant Health Monitoring - {title_suffix}', 
                fontsize=16, fontweight='bold', y=0.995)
    
    # Save plot
    if save_path is None:
        os.makedirs(config['paths']['outputs'], exist_ok=True)
        save_path = os.path.join(config['paths']['outputs'], 'training_visualization.png')
    
    plt.savefig(save_path, dpi=300, bbox_inches='tight', facecolor='white')
    print(f"\n✓ Training visualization saved: {save_path}")
    
    return fig


def plot_phase_comparison(phase1_df, phase2_df, save_path=None):
    """
    Create side-by-side comparison of Phase 1 and Phase 2
    """
    if phase1_df is None or phase2_df is None:
        print("⚠ Both phases required for comparison plot")
        return
    
    fig, axes = plt.subplots(2, 2, figsize=(16, 10))
    
    # Phase 1 Accuracy
    axes[0, 0].plot(phase1_df['epoch'], phase1_df['accuracy'], 
                   label='Train', color='#2E86AB', linewidth=2, marker='o')
    axes[0, 0].plot(phase1_df['epoch'], phase1_df['val_accuracy'], 
                   label='Val', color='#A23B72', linewidth=2, marker='s')
    axes[0, 0].set_title('Phase 1: Accuracy (Head Only)', fontweight='bold', fontsize=12)
    axes[0, 0].set_xlabel('Epoch')
    axes[0, 0].set_ylabel('Accuracy')
    axes[0, 0].legend()
    axes[0, 0].grid(True, alpha=0.3)
    axes[0, 0].set_ylim([0, 1])
    
    # Phase 2 Accuracy
    axes[0, 1].plot(phase2_df['epoch'], phase2_df['accuracy'], 
                   label='Train', color='#2E86AB', linewidth=2, marker='o')
    axes[0, 1].plot(phase2_df['epoch'], phase2_df['val_accuracy'], 
                   label='Val', color='#A23B72', linewidth=2, marker='s')
    axes[0, 1].set_title('Phase 2: Accuracy (Fine-Tuning)', fontweight='bold', fontsize=12)
    axes[0, 1].set_xlabel('Epoch')
    axes[0, 1].set_ylabel('Accuracy')
    axes[0, 1].legend()
    axes[0, 1].grid(True, alpha=0.3)
    axes[0, 1].set_ylim([0, 1])
    
    # Phase 1 Loss
    axes[1, 0].plot(phase1_df['epoch'], phase1_df['loss'], 
                   label='Train', color='#2E86AB', linewidth=2, marker='o')
    axes[1, 0].plot(phase1_df['epoch'], phase1_df['val_loss'], 
                   label='Val', color='#A23B72', linewidth=2, marker='s')
    axes[1, 0].set_title('Phase 1: Loss (Head Only)', fontweight='bold', fontsize=12)
    axes[1, 0].set_xlabel('Epoch')
    axes[1, 0].set_ylabel('Loss')
    axes[1, 0].legend()
    axes[1, 0].grid(True, alpha=0.3)
    
    # Phase 2 Loss
    axes[1, 1].plot(phase2_df['epoch'], phase2_df['loss'], 
                   label='Train', color='#2E86AB', linewidth=2, marker='o')
    axes[1, 1].plot(phase2_df['epoch'], phase2_df['val_loss'], 
                   label='Val', color='#A23B72', linewidth=2, marker='s')
    axes[1, 1].set_title('Phase 2: Loss (Fine-Tuning)', fontweight='bold', fontsize=12)
    axes[1, 1].set_xlabel('Epoch')
    axes[1, 1].set_ylabel('Loss')
    axes[1, 1].legend()
    axes[1, 1].grid(True, alpha=0.3)
    
    plt.suptitle('Training Phases Comparison', fontsize=16, fontweight='bold')
    plt.tight_layout()
    
    # Save
    if save_path is None:
        os.makedirs(config['paths']['outputs'], exist_ok=True)
        save_path = os.path.join(config['paths']['outputs'], 'phase_comparison.png')
    
    plt.savefig(save_path, dpi=300, bbox_inches='tight', facecolor='white')
    print(f"✓ Phase comparison saved: {save_path}")
    
    return fig


def plot_metrics_improvement(phase1_df, phase2_df, save_path=None):
    """
    Show improvement from Phase 1 to Phase 2
    """
    if phase1_df is None or phase2_df is None:
        print("⚠ Both phases required for improvement plot")
        return
    
    fig, ax = plt.subplots(figsize=(10, 6))
    
    metrics = ['Val Accuracy', 'Val Loss', 'Val Top-2 Acc']
    phase1_values = [
        phase1_df['val_accuracy'].max() if 'val_accuracy' in phase1_df.columns else 0,
        phase1_df['val_loss'].min() if 'val_loss' in phase1_df.columns else 0,
        phase1_df['val_top_2_accuracy'].max() if 'val_top_2_accuracy' in phase1_df.columns else 0
    ]
    phase2_values = [
        phase2_df['val_accuracy'].max() if 'val_accuracy' in phase2_df.columns else 0,
        phase2_df['val_loss'].min() if 'val_loss' in phase2_df.columns else 0,
        phase2_df['val_top_2_accuracy'].max() if 'val_top_2_accuracy' in phase2_df.columns else 0
    ]
    
    x = range(len(metrics))
    width = 0.35
    
    bars1 = ax.bar([i - width/2 for i in x], phase1_values, width, 
                   label='Phase 1', color='#3498db', alpha=0.8)
    bars2 = ax.bar([i + width/2 for i in x], phase2_values, width, 
                   label='Phase 2', color='#2ecc71', alpha=0.8)
    
    # Add value labels
    for bars in [bars1, bars2]:
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                   f'{height:.3f}',
                   ha='center', va='bottom', fontsize=10, fontweight='bold')
    
    ax.set_ylabel('Value', fontweight='bold')
    ax.set_title('Performance Improvement: Phase 1 vs Phase 2', fontsize=14, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(metrics)
    ax.legend()
    ax.grid(True, alpha=0.3, axis='y')
    
    plt.tight_layout()
    
    # Save
    if save_path is None:
        os.makedirs(config['paths']['outputs'], exist_ok=True)
        save_path = os.path.join(config['paths']['outputs'], 'metrics_improvement.png')
    
    plt.savefig(save_path, dpi=300, bbox_inches='tight', facecolor='white')
    print(f"✓ Metrics improvement saved: {save_path}")
    
    return fig


def main():
    """
    Main function to generate all training visualizations
    """
    print("\n" + "="*70)
    print("TRAINING VISUALIZATION TOOL")
    print("="*70 + "\n")
    
    # Load logs
    phase1_df, phase2_df = load_training_logs()
    
    if phase1_df is None and phase2_df is None:
        print("\n✗ No training logs found!")
        print("Please train the model first using: python train.py")
        return
    
    print("\n■ Generating visualizations...\n")
    
    # Generate plots
    try:
        # Main combined plot
        plot_combined_metrics(phase1_df, phase2_df)
        
        # Phase comparison (if both phases exist)
        if phase1_df is not None and phase2_df is not None:
            plot_phase_comparison(phase1_df, phase2_df)
            plot_metrics_improvement(phase1_df, phase2_df)
        
        print("\n" + "="*70)
        print("✓ ALL VISUALIZATIONS GENERATED SUCCESSFULLY!")
        print("="*70)
        print(f"\nVisualization files saved in: {config['paths']['outputs']}/")
        print(" - training_visualization.png (Main dashboard)")
        if phase1_df is not None and phase2_df is not None:
            print(" - phase_comparison.png (Phase 1 vs Phase 2)")
            print(" - metrics_improvement.png (Improvement chart)")
        print("="*70 + "\n")
        
    except Exception as e:
        print(f"\n✗ Error generating visualizations: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()