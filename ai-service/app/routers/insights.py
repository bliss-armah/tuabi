from fastapi import APIRouter, HTTPException, Depends
from typing import List
import logging
from datetime import datetime

from app.models.schemas import (
    SmartRecommendation, UserInsightsRequest, UserInsightsResponse,
    ModelStatus, ModelTrainingRequest
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

@router.post("/recommendations", response_model=List[SmartRecommendation])
async def get_recommendations(
    request: UserInsightsRequest,
    model_service: ModelService = Depends(get_model_service)
):
    """
    Get smart recommendations for debt management
    """
    try:
        recommendations = await model_service.generate_recommendations(request.user_id)
        return recommendations
    except Exception as e:
        logger.error(f"Error generating recommendations: {e}")
        raise HTTPException(status_code=500, detail="Recommendation generation failed")

@router.post("/comprehensive-analysis", response_model=UserInsightsResponse)
async def get_comprehensive_analysis(
    request: UserInsightsRequest,
    model_service: ModelService = Depends(get_model_service)
):
    """
    Get comprehensive AI analysis including risk assessment, predictions, and recommendations
    """
    try:
        # Get all insights
        risk_assessments = await model_service.assess_risk(request.user_id)
        payment_predictions = await model_service.predict_payments(request.user_id)
        cash_flow_prediction = await model_service.predict_cash_flow(request.user_id)
        recommendations = await model_service.generate_recommendations(request.user_id)
        
        return UserInsightsResponse(
            user_id=request.user_id,
            risk_assessments=risk_assessments,
            payment_predictions=payment_predictions,
            cash_flow_prediction=cash_flow_prediction,
            recommendations=recommendations,
            generated_at=datetime.now()
        )
    except Exception as e:
        logger.error(f"Error in comprehensive analysis: {e}")
        raise HTTPException(status_code=500, detail="Comprehensive analysis failed")

@router.get("/recommendations/{user_id}", response_model=List[SmartRecommendation])
async def get_recommendations_by_user(
    user_id: int,
    model_service: ModelService = Depends(get_model_service)
):
    """
    Get recommendations for a user (alternative GET endpoint)
    """
    try:
        recommendations = await model_service.generate_recommendations(user_id)
        return recommendations
    except Exception as e:
        logger.error(f"Error generating recommendations: {e}")
        raise HTTPException(status_code=500, detail="Recommendation generation failed")

@router.get("/comprehensive-analysis/{user_id}", response_model=UserInsightsResponse)
async def get_comprehensive_analysis_by_user(
    user_id: int,
    model_service: ModelService = Depends(get_model_service)
):
    """
    Get comprehensive analysis for a user (alternative GET endpoint)
    """
    try:
        # Get all insights
        risk_assessments = await model_service.assess_risk(user_id)
        payment_predictions = await model_service.predict_payments(user_id)
        cash_flow_prediction = await model_service.predict_cash_flow(user_id)
        recommendations = await model_service.generate_recommendations(user_id)
        
        return UserInsightsResponse(
            user_id=user_id,
            risk_assessments=risk_assessments,
            payment_predictions=payment_predictions,
            cash_flow_prediction=cash_flow_prediction,
            recommendations=recommendations,
            generated_at=datetime.now()
        )
    except Exception as e:
        logger.error(f"Error in comprehensive analysis: {e}")
        raise HTTPException(status_code=500, detail="Comprehensive analysis failed")

@router.post("/retrain-models")
async def retrain_models(
    request: ModelTrainingRequest,
    model_service: ModelService = Depends(get_model_service)
):
    """
    Retrain the ML models with latest data
    """
    try:
        if request.retrain_models:
            await model_service.train_models()
            return {"message": "Models retrained successfully"}
        else:
            return {"message": "Model retraining skipped"}
    except Exception as e:
        logger.error(f"Error retraining models: {e}")
        raise HTTPException(status_code=500, detail="Model retraining failed")

@router.get("/model-status", response_model=List[ModelStatus])
async def get_model_status(
    model_service: ModelService = Depends(get_model_service)
):
    """
    Get status of all ML models
    """
    try:
        # This is a simplified status - in production you'd track more metrics
        status = [
            ModelStatus(
                model_name="Risk Assessment Model",
                is_trained=model_service.risk_model is not None,
                last_trained=datetime.now(),  # Would track actual timestamp
                accuracy_score=0.85,  # Would get from model evaluation
                sample_size=100  # Would get from training data
            ),
            ModelStatus(
                model_name="Payment Prediction Model",
                is_trained=model_service.payment_model is not None,
                last_trained=datetime.now(),
                accuracy_score=0.78,
                sample_size=100
            )
        ]
        return status
    except Exception as e:
        logger.error(f"Error getting model status: {e}")
        raise HTTPException(status_code=500, detail="Model status retrieval failed") 