"""Cycle prediction using linear regression and rolling mean."""
import numpy as np
from datetime import datetime, timedelta

class CyclePredictor:
    def predict_next_cycle(self, cycle_history: list[int], last_period_start: str) -> dict:
        if not cycle_history:
            cycle_history = [28]
        
        arr = np.array(cycle_history, dtype=float)
        
        # Rolling mean (weighted towards recent cycles)
        if len(arr) >= 3:
            weights = np.linspace(0.5, 1.5, len(arr))
            weighted_mean = np.average(arr, weights=weights)
        else:
            weighted_mean = np.mean(arr)
        
        # Simple linear regression for trend
        if len(arr) >= 3:
            x = np.arange(len(arr))
            coeffs = np.polyfit(x, arr, 1)
            trend_prediction = coeffs[0] * len(arr) + coeffs[1]
            predicted_length = round((weighted_mean * 0.7 + trend_prediction * 0.3))
        else:
            predicted_length = round(weighted_mean)
        
        predicted_length = max(21, min(45, predicted_length))
        
        # Confidence interval based on variance
        if len(arr) >= 3:
            std = np.std(arr)
            confidence_days = max(1, min(7, round(std)))
        else:
            confidence_days = 3
        
        # Calculate dates
        start_date = datetime.fromisoformat(last_period_start)
        predicted_start = start_date + timedelta(days=int(predicted_length))
        avg_period = 5
        predicted_end = predicted_start + timedelta(days=avg_period)
        
        return {
            'predicted_start': predicted_start.strftime('%Y-%m-%d'),
            'predicted_end': predicted_end.strftime('%Y-%m-%d'),
            'confidence_interval_days': confidence_days,
            'predicted_length': int(predicted_length),
        }

cycle_predictor = CyclePredictor()
