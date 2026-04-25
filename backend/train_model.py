"""Train and save PCOD prediction model on synthetic data."""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from data.generate_synthetic import generate_synthetic_data
from models.pcod_model import pcod_model

def train():
    print("Generating synthetic training data...")
    df = generate_synthetic_data(2000)
    
    feature_cols = ['cycle_variance', 'avg_gap', 'symptom_score', 'acne_flag', 'hair_loss_flag', 'flow_irregularity']
    X = df[feature_cols].values
    y = df['risk_label'].values
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print("Training Random Forest model...")
    pcod_model.train(X_train, y_train)
    
    # Evaluate
    X_test_scaled = pcod_model.scaler.transform(X_test)
    accuracy = pcod_model.model.score(X_test_scaled, y_test)
    print(f"Test Accuracy: {accuracy:.4f}")
    
    cv_scores = cross_val_score(pcod_model.model, pcod_model.scaler.transform(X), y, cv=5)
    print(f"Cross-val Accuracy: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
    
    print("\nFeature Importances:")
    for name, imp in zip(feature_cols, pcod_model.model.feature_importances_):
        print(f"  {name}: {imp:.4f}")
    
    # Test prediction
    sample = {'cycle_variance': 8.5, 'avg_gap': 45, 'symptom_score': 0.7, 'acne_flag': 1, 'hair_loss_flag': 1, 'flow_irregularity': 0.6}
    result = pcod_model.predict(sample)
    print(f"\nSample prediction: {result}")
    print("Training complete!")

if __name__ == '__main__':
    train()
