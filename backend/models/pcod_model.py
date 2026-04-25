"""PCOD Risk Prediction Model using Random Forest Classifier."""
import numpy as np
import pickle
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'saved_models')

class PCODModel:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_names = [
            'cycle_variance', 'avg_gap', 'symptom_score',
            'acne_flag', 'hair_loss_flag', 'flow_irregularity'
        ]
        self._load_or_init()
    
    def _load_or_init(self):
        model_path = os.path.join(MODEL_DIR, 'pcod_rf_model.pkl')
        scaler_path = os.path.join(MODEL_DIR, 'pcod_scaler.pkl')
        
        if os.path.exists(model_path) and os.path.exists(scaler_path):
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)
            with open(scaler_path, 'rb') as f:
                self.scaler = pickle.load(f)
        else:
            self.model = RandomForestClassifier(
                n_estimators=100, max_depth=10, random_state=42, class_weight='balanced'
            )
            self.scaler = StandardScaler()
    
    def train(self, X: np.ndarray, y: np.ndarray):
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y)
        os.makedirs(MODEL_DIR, exist_ok=True)
        with open(os.path.join(MODEL_DIR, 'pcod_rf_model.pkl'), 'wb') as f:
            pickle.dump(self.model, f)
        with open(os.path.join(MODEL_DIR, 'pcod_scaler.pkl'), 'wb') as f:
            pickle.dump(self.scaler, f)
    
    def predict(self, features: dict) -> dict:
        X = np.array([[
            features.get('cycle_variance', 2.0),
            features.get('avg_gap', 28.0),
            features.get('symptom_score', 0.1),
            features.get('acne_flag', 0),
            features.get('hair_loss_flag', 0),
            features.get('flow_irregularity', 0.1),
        ]])
        
        X_scaled = self.scaler.transform(X)
        proba = self.model.predict_proba(X_scaled)[0]
        risk_score = round(proba[1] * 100, 1) if len(proba) > 1 else 0
        
        importances = self.model.feature_importances_
        factor_weights = {
            name: round(float(imp), 4)
            for name, imp in zip(self.feature_names, importances)
        }
        
        if risk_score <= 30:
            risk_level = 'low'
        elif risk_score <= 60:
            risk_level = 'moderate'
        else:
            risk_level = 'high'
        
        return {
            'risk_score': risk_score,
            'risk_level': risk_level,
            'factors': factor_weights,
        }

pcod_model = PCODModel()
