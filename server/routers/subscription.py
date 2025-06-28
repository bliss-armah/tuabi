from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
import json
from datetime import datetime, timedelta

from database import get_db
from models import models
from schemas import subscription as subscription_schemas
from paystack_service import paystack_service, DEFAULT_PLANS
from JWTtoken import create_access_token


router = APIRouter(
    prefix="/subscription",
    tags=['Subscription']
)

@router.get("/plans", response_model=List[subscription_schemas.SubscriptionPlan])
def get_subscription_plans():
    """
    Get available subscription plans
    """
    plans = []
    for plan_id, plan_data in DEFAULT_PLANS.items():
        plans.append(subscription_schemas.SubscriptionPlan(
            id=plan_id,
            name=plan_data["name"],
            amount=plan_data["amount"],
            currency="NGN",
            interval=plan_data["interval"],
            description=plan_data["description"]
        ))
    return plans

@router.post("/initialize", response_model=subscription_schemas.PaystackInitializeResponse)
def initialize_subscription_payment(
    request: subscription_schemas.PaystackInitializeRequest,
    current_user: models.User = Depends(create_access_token),
    db: Session = Depends(get_db)
):
    """
    Initialize a subscription payment with Paystack
    """
    try:
        # Validate plan type
        if request.plan_type not in DEFAULT_PLANS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid plan type"
            )
        
        plan_data = DEFAULT_PLANS[request.plan_type]
        
        # Generate unique reference
        reference = f"SUB_{current_user.id}_{uuid.uuid4().hex[:8].upper()}"
        
        # Initialize Paystack transaction
        paystack_response = paystack_service.initialize_transaction(
            email=request.email,
            amount=plan_data["amount"],
            reference=reference,
            callback_url=request.callback_url,
            transaction_metadata={
                "user_id": current_user.id,
                "plan_type": request.plan_type,
                "plan_name": plan_data["name"]
            }
        )
        
        if paystack_response.get("status"):
            # Store pending transaction
            transaction = models.Transaction(
                user_id=current_user.id,
                paystack_transaction_id=paystack_response["data"]["id"],
                paystack_reference=reference,
                amount=plan_data["amount"],
                currency="NGN",
                status="pending",
                description=f"Subscription payment for {plan_data['name']}",
                transaction_metadata=json.dumps({
                    "plan_type": request.plan_type,
                    "plan_name": plan_data["name"]
                })
            )
            db.add(transaction)
            db.commit()
            
            return subscription_schemas.PaystackInitializeResponse(
                status=True,
                message="Payment initialized successfully",
                data=paystack_response["data"]
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to initialize payment"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/verify", response_model=subscription_schemas.PaystackVerifyResponse)
def verify_subscription_payment(
    request: subscription_schemas.PaystackVerifyRequest,
    current_user: models.User = Depends(create_access_token),
    db: Session = Depends(get_db)
):
    """
    Verify a subscription payment with Paystack
    """
    try:
        # Find transaction by reference
        transaction = db.query(models.Transaction).filter(
            models.Transaction.paystack_reference == request.reference,
            models.Transaction.user_id == current_user.id
        ).first()
        
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found"
            )
        
        # Verify with Paystack
        paystack_response = paystack_service.verify_transaction(request.reference)
        
        if paystack_response.get("status") and paystack_response["data"]["status"] == "success":
            # Update transaction status
            transaction.status = "success"
            transaction.payment_method = paystack_response["data"].get("channel", "unknown")
            transaction.transaction_metadata = json.dumps(paystack_response["data"])
            db.commit()
            
            # Create or update subscription
            metadata = json.loads(transaction.transaction_metadata) if transaction.transaction_metadata else {}
            plan_type = metadata.get("plan_type", "monthly")
            plan_data = DEFAULT_PLANS[plan_type]
            
            # Calculate subscription end date
            if plan_type == "monthly":
                end_date = datetime.now() + timedelta(days=30)
            else:  # yearly
                end_date = datetime.now() + timedelta(days=365)
            
            # Create subscription
            subscription = models.Subscription(
                user_id=current_user.id,
                plan_type=plan_type,
                amount=plan_data["amount"],
                currency="NGN",
                status="active",
                end_date=end_date,
                paystack_subscription_id=paystack_response["data"].get("id"),
                paystack_customer_id=paystack_response["data"].get("customer", {}).get("id")
            )
            db.add(subscription)
            
            # Update user subscription status
            current_user.is_subscribed = True
            current_user.subscription_expires_at = end_date
            
            # Link transaction to subscription
            transaction.subscription_id = subscription.id
            
            db.commit()
            
            return subscription_schemas.PaystackVerifyResponse(
                status=True,
                message="Payment verified and subscription activated",
                data=paystack_response["data"]
            )
        else:
            # Update transaction status to failed
            transaction.status = "failed"
            transaction.transaction_metadata = json.dumps(paystack_response["data"])
            db.commit()
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment verification failed"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/status", response_model=subscription_schemas.UserSubscriptionStatus)
def get_user_subscription_status(
    current_user: models.User = Depends(create_access_token),
    db: Session = Depends(get_db)
):
    """
    Get current user's subscription status
    """
    # Get current active subscription
    current_subscription = db.query(models.Subscription).filter(
        models.Subscription.user_id == current_user.id,
        models.Subscription.status == "active",
        models.Subscription.end_date > datetime.now()
    ).first()
    
    # Get active transactions
    active_transactions = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.status.in_(["pending", "success"])
    ).all()
    
    return subscription_schemas.UserSubscriptionStatus(
        is_subscribed=current_user.is_subscribed and current_user.subscription_expires_at and current_user.subscription_expires_at > datetime.now(),
        subscription_expires_at=current_user.subscription_expires_at,
        current_plan=current_subscription,
        active_transactions=active_transactions
    )

@router.get("/transactions", response_model=List[subscription_schemas.TransactionResponse])
def get_user_transactions(
    current_user: models.User = Depends(create_access_token),
    db: Session = Depends(get_db)
):
    """
    Get all transactions for current user
    """
    transactions = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id
    ).order_by(models.Transaction.created_at.desc()).all()
    
    return transactions

@router.get("/subscriptions", response_model=List[subscription_schemas.SubscriptionResponse])
def get_user_subscriptions(
    current_user: models.User = Depends(create_access_token),
    db: Session = Depends(get_db)
):
    """
    Get all subscriptions for current user
    """
    subscriptions = db.query(models.Subscription).filter(
        models.Subscription.user_id == current_user.id
    ).order_by(models.Subscription.created_at.desc()).all()
    
    return subscriptions 