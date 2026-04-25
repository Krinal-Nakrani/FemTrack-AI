"""FemTrack AI — FastAPI Backend for PCOD Prediction & Cycle Analysis."""
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from schemas.requests import (
    PCODPredictionRequest, PCODPredictionResponse,
    CyclePredictionRequest, CyclePredictionResponse,
)
from models.pcod_model import pcod_model
from models.cycle_predictor import cycle_predictor
from models.anomaly_detector import anomaly_detector

app = FastAPI(
    title="FemTrack AI API",
    description="Smart Period Tracking & PCOD Risk Prediction Backend",
    version="1.0.0",
)

# CORS — allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "healthy", "service": "FemTrack AI API", "version": "1.0.0"}


@app.post("/api/predict-pcod", response_model=PCODPredictionResponse)
async def predict_pcod(request: PCODPredictionRequest):
    # Extract features from request
    cycle_lengths = request.cycle_lengths or [28]
    arr = np.array(cycle_lengths, dtype=float)
    
    cycle_variance = float(np.std(arr)) if len(arr) > 1 else 2.0
    avg_gap = float(np.mean(arr))
    
    symptoms = request.symptom_scores or {}
    symptom_score = float(np.mean(list(symptoms.values()))) if symptoms else 0.1
    acne_flag = 1 if symptoms.get('acne', 0) > 0.3 else 0
    hair_loss_flag = 1 if symptoms.get('hair_loss', 0) > 0.3 else 0
    
    lifestyle = request.lifestyle or {}
    stress = lifestyle.get('stress', 2)
    sleep = lifestyle.get('sleep', 7)
    flow_irregularity = min(1.0, cycle_variance / 10 + (stress / 5) * 0.2 + max(0, (7 - sleep) / 7) * 0.1)
    
    features = {
        'cycle_variance': cycle_variance,
        'avg_gap': avg_gap,
        'symptom_score': symptom_score,
        'acne_flag': acne_flag,
        'hair_loss_flag': hair_loss_flag,
        'flow_irregularity': flow_irregularity,
    }
    
    result = pcod_model.predict(features)
    
    # Add next cycle prediction if we have history
    next_prediction = None
    if request.cycle_lengths and len(request.cycle_lengths) >= 1:
        from datetime import date
        pred = cycle_predictor.predict_next_cycle(
            request.cycle_lengths,
            date.today().isoformat()
        )
        next_prediction = {
            'start': pred['predicted_start'],
            'end': pred['predicted_end'],
            'confidence': str(1 - pred['confidence_interval_days'] / 10),
        }
    
    return PCODPredictionResponse(
        risk_score=result['risk_score'],
        risk_level=result['risk_level'],
        factors=result['factors'],
        next_cycle_prediction=next_prediction,
    )


@app.post("/api/predict-next-cycle", response_model=CyclePredictionResponse)
async def predict_next_cycle(request: CyclePredictionRequest):
    result = cycle_predictor.predict_next_cycle(
        request.cycle_history,
        request.last_period_start,
    )
    return CyclePredictionResponse(**result)


@app.post("/api/detect-anomalies")
async def detect_anomalies(cycle_lengths: list[int]):
    return anomaly_detector.detect_anomalies(cycle_lengths)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
