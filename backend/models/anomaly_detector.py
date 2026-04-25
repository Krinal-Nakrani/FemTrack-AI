"""Anomaly detection in cycle patterns using Isolation Forest."""
import numpy as np
from sklearn.ensemble import IsolationForest

class AnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(contamination=0.1, random_state=42)
    
    def detect_anomalies(self, cycle_lengths: list[int]) -> dict:
        if len(cycle_lengths) < 3:
            return {'anomalies': [], 'is_irregular': False}
        
        arr = np.array(cycle_lengths).reshape(-1, 1)
        self.model.fit(arr)
        predictions = self.model.predict(arr)
        
        anomalies = [
            {'cycle_index': int(i), 'length': int(cycle_lengths[i]), 'is_anomaly': True}
            for i in range(len(predictions)) if predictions[i] == -1
        ]
        
        return {
            'anomalies': anomalies,
            'is_irregular': len(anomalies) > len(cycle_lengths) * 0.2,
            'anomaly_count': len(anomalies),
            'total_cycles': len(cycle_lengths),
        }

anomaly_detector = AnomalyDetector()
