"""FemTrack AI — FastAPI Backend for PCOD Prediction & Cycle Analysis."""
import os
import resend
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

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


@app.post("/api/send-invite")
async def send_invite(email: str, code: str, sender_name: str):
    api_key = os.getenv("RESEND_API_KEY")
    if not api_key:
        return {"status": "error", "message": "Resend API key not configured."}
    
    resend.api_key = api_key
    
    # Generate the signup link with the invite code
    invite_link = f"http://localhost:5173/auth?invite={code}&email={email}"
    
    try:
        r = resend.Emails.send({
            "from": "FemTrack AI <onboarding@resend.dev>",
            "to": email,
            "subject": f"{sender_name} invited you to FemTrack AI",
            "html": f"""
                <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #fcfaff; border: 1px solid #e9d5ff; border-radius: 24px;">
                    <h2 style="color: #1a0a2e; text-align: center; font-size: 24px; margin-bottom: 8px;">FemTrack AI 🌸</h2>
                    <p style="color: #6b7280; text-align: center; margin-bottom: 32px;">Smart Period Tracking & PCOD Risk Prediction</p>
                    
                    <p style="color: #1a0a2e; font-size: 16px;">Hi there!</p>
                    <p style="color: #1a0a2e; font-size: 16px; line-height: 1.6;">
                        <strong>{sender_name}</strong> has invited you to view their wellness dashboard. This allows you to stay informed about their cycle health and support them effectively.
                    </p>
                    
                    <div style="background-color: #ffffff; padding: 32px; border-radius: 20px; text-align: center; margin: 32px 0; border: 1px solid #f3e8ff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                        <p style="margin: 0 0 12px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #C94B8A;">Your Invite Code</p>
                        <h1 style="margin: 0 0 24px 0; letter-spacing: 4px; color: #1a0a2e; font-size: 32px; font-family: monospace;">{code}</h1>
                        
                        <a href="{invite_link}" style="display: inline-block; background: linear-gradient(135deg, #C94B8A, #FF6B9D); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 14px; font-weight: 600; font-size: 16px; transition: transform 0.2s;">Accept Invitation</a>
                    </div>
                    
                    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 32px;">
                        If the button doesn't work, copy and paste this link into your browser:<br>
                        <span style="color: #C94B8A; word-break: break-all;">{invite_link}</span>
                    </p>
                </div>
            """
        })
        return {"status": "success", "id": r["id"]}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
