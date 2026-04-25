from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class PCODPredictionRequest(BaseModel):
    cycle_lengths: List[int] = Field(default_factory=list, description="List of recent cycle lengths in days")
    symptom_scores: Dict[str, float] = Field(default_factory=dict, description="Symptom frequency scores")
    lifestyle: Dict[str, float] = Field(default_factory=dict, description="Lifestyle metrics")
    gaps: List[int] = Field(default_factory=list, description="Gaps between cycles in days")

class PCODPredictionResponse(BaseModel):
    risk_score: float = Field(..., ge=0, le=100)
    risk_level: str = Field(..., pattern="^(low|moderate|high)$")
    factors: Dict[str, float]
    next_cycle_prediction: Optional[Dict[str, str]] = None

class CyclePredictionRequest(BaseModel):
    cycle_history: List[int] = Field(..., description="List of past cycle lengths")
    last_period_start: str = Field(..., description="ISO date of last period start")

class CyclePredictionResponse(BaseModel):
    predicted_start: str
    predicted_end: str
    confidence_interval_days: int
    predicted_length: int
