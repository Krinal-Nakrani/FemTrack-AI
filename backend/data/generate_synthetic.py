"""Generate synthetic training data for PCOD risk prediction model."""
import numpy as np
import pandas as pd
import os

def generate_synthetic_data(n_samples: int = 2000) -> pd.DataFrame:
    np.random.seed(42)
    
    data = []
    for _ in range(n_samples):
        # Determine if this sample has PCOD (roughly 30% prevalence)
        has_pcod = np.random.random() < 0.3
        
        if has_pcod:
            cycle_variance = np.random.uniform(5, 20)
            avg_gap = np.random.uniform(35, 90)
            symptom_score = np.random.uniform(0.4, 1.0)
            acne_flag = 1 if np.random.random() < 0.7 else 0
            hair_loss_flag = 1 if np.random.random() < 0.5 else 0
            flow_irregularity = np.random.uniform(0.4, 1.0)
            risk_label = 1
        else:
            cycle_variance = np.random.uniform(0, 5)
            avg_gap = np.random.uniform(21, 35)
            symptom_score = np.random.uniform(0, 0.5)
            acne_flag = 1 if np.random.random() < 0.15 else 0
            hair_loss_flag = 1 if np.random.random() < 0.08 else 0
            flow_irregularity = np.random.uniform(0, 0.4)
            risk_label = 0
        
        data.append({
            'cycle_variance': round(cycle_variance, 2),
            'avg_gap': round(avg_gap, 1),
            'symptom_score': round(symptom_score, 3),
            'acne_flag': acne_flag,
            'hair_loss_flag': hair_loss_flag,
            'flow_irregularity': round(flow_irregularity, 3),
            'risk_label': risk_label,
        })
    
    df = pd.DataFrame(data)
    
    os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)
    csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'synthetic_pcod_data.csv')
    df.to_csv(csv_path, index=False)
    print(f"Generated {n_samples} samples, saved to {csv_path}")
    print(f"PCOD positive: {df['risk_label'].sum()} ({df['risk_label'].mean()*100:.1f}%)")
    
    return df

if __name__ == '__main__':
    generate_synthetic_data()
