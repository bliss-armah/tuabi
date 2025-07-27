from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
import logging

from app.models.schemas import (
    DebtorRiskAssessment, PaymentPrediction, CashFlowPrediction,
    DebtorAnalysisRequest, UserInsightsRequest
)
from app.services.model_service import ModelService

logger = logging.getLogger(__name__)
router = APIRouter()

# Dependency to get the model service
async def get_model_service() -> ModelService:
    from app.main import model_service
    if not model_service or not model_service.is_ready():
        raise HTTPException(status_code=503, detail="AI models not ready")
    return model_service

@router.post("/risk-assessment", response_model=List[DebtorRiskAssessment])
async def assess_debtor_risk(
    request: DebtorAnalysisRequest,
    model_service: ModelService = Depends(get_model_service)
):
    """
    Assess risk for a user's debtors or a specific debtor
    """
    try:
        assessments = await model_service.assess_risk(
            user_id=request.user_id,
            debtor_id=request.debtor_id
        )
        return assessments
    except Exception as e:
        logger.error(f"Error in risk assessment: {e}")
        raise HTTPException(status_code=500, detail="Risk assessment failed")

@router.post("/payment-predictions", response_model=List[PaymentPrediction])
async def predict_payments(
    request: DebtorAnalysisRequest,
    model_service: ModelService = Depends(get_model_service)
):
    """
    Predict payment likelihood and timing for debtors
    """
    try:
        predictions = await model_service.predict_payments(
            user_id=request.user_id,
            debtor_id=request.debtor_id
        )
        return predictions
    except Exception as e:
        logger.error(f"Error in payment predictions: {e}")
        raise HTTPException(status_code=500, detail="Payment prediction failed")

@router.post("/cash-flow", response_model=CashFlowPrediction)
async def predict_cash_flow(
    request: UserInsightsRequest,
    model_service: ModelService = Depends(get_model_service)
):
    """
    Predict future cash flow based on payment predictions
    """
    try:
        prediction = await model_service.predict_cash_flow(request.user_id)
        return prediction
    except Exception as e:
        logger.error(f"Error in cash flow prediction: {e}")
        raise HTTPException(status_code=500, detail="Cash flow prediction failed")

@router.get("/risk-assessment/{user_id}", response_model=List[DebtorRiskAssessment])
async def get_risk_assessment_by_user(
    user_id: int,
    debtor_id: Optional[int] = None,
    model_service: ModelService = Depends(get_model_service)
):
    """
    Get risk assessment for a user (alternative GET endpoint)
    """
    try:
        assessments = await model_service.assess_risk(
            user_id=user_id,
            debtor_id=debtor_id
        )
        return assessments
    except Exception as e:
        logger.error(f"Error in risk assessment: {e}")
        raise HTTPException(status_code=500, detail="Risk assessment failed")

@router.get("/payment-predictions/{user_id}", response_model=List[PaymentPrediction])
async def get_payment_predictions_by_user(
    user_id: int,
    debtor_id: Optional[int] = None,
    model_service: ModelService = Depends(get_model_service)
):
    """
    Get payment predictions for a user (alternative GET endpoint)
    """
    try:
        predictions = await model_service.predict_payments(
            user_id=user_id,
            debtor_id=debtor_id
        )
        return predictions
    except Exception as e:
        logger.error(f"Error in payment predictions: {e}")
        raise HTTPException(status_code=500, detail="Payment prediction failed")

@router.get("/cash-flow/{user_id}", response_model=CashFlowPrediction)
async def get_cash_flow_by_user(
    user_id: int,
    model_service: ModelService = Depends(get_model_service)
):
    """
    Get cash flow prediction for a user (alternative GET endpoint)
    """
    try:
        prediction = await model_service.predict_cash_flow(user_id)
        return prediction
    except Exception as e:
        logger.error(f"Error in cash flow prediction: {e}")
        raise HTTPException(status_code=500, detail="Cash flow prediction failed") 