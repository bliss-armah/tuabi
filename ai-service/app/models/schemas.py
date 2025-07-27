from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class DebtorRiskAssessment(BaseModel):
    debtor_id: int
    risk_level: RiskLevel
    risk_score: float = Field(..., ge=0, le=1, description="Risk score between 0 and 1")
    confidence: float = Field(..., ge=0, le=1, description="Model confidence")
    factors: List[str] = Field(..., description="Key risk factors")

class PaymentPrediction(BaseModel):
    debtor_id: int
    predicted_payment_date: Optional[datetime]
    prediction_confidence: float = Field(..., ge=0, le=1)
    predicted_amount: Optional[float]
    likelihood_of_payment: float = Field(..., ge=0, le=1)

class CashFlowPrediction(BaseModel):
    user_id: int
    predictions: List[Dict[str, Any]] = Field(..., description="Monthly cash flow predictions")
    total_expected: float
    confidence_interval: Dict[str, float]

class SmartRecommendation(BaseModel):
    debtor_id: int
    recommendation_type: str
    message: str
    priority: int = Field(..., ge=1, le=5)
    suggested_action: str
    optimal_time: Optional[datetime]

class UserInsightsRequest(BaseModel):
    user_id: int

class DebtorAnalysisRequest(BaseModel):
    user_id: int
    debtor_id: Optional[int] = None

class UserInsightsResponse(BaseModel):
    user_id: int
    risk_assessments: List[DebtorRiskAssessment]
    payment_predictions: List[PaymentPrediction]
    cash_flow_prediction: CashFlowPrediction
    recommendations: List[SmartRecommendation]
    generated_at: datetime

class ModelTrainingRequest(BaseModel):
    retrain_models: bool = True
    
class ModelStatus(BaseModel):
    model_name: str
    is_trained: bool
    last_trained: Optional[datetime]
    accuracy_score: Optional[float]
    sample_size: int 