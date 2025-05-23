from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from schemas.debtor import DebtHistory, DebtHistoryCreate
from repositories import debt_history
from database import get_db
from oauth2 import get_current_user
from models import models

router = APIRouter(prefix="/debt-history", tags=["Debt History"])

@router.post("/{debtor_id}", response_model=DebtHistory)
def add_payment(
    debtor_id: int, 
    payment: DebtHistoryCreate, 
    db: Session = Depends(get_db), 
    user=Depends(get_current_user)
):
    """Add a payment or debt record for a specific debtor"""
    return debt_history.create_history_entry(db, debtor_id, payment, user.id)

@router.get("/{debtor_id}", response_model=List[DebtHistory])
def get_debtor_history(
    debtor_id: int, 
    db: Session = Depends(get_db), 
    user=Depends(get_current_user)
):
    """Get payment history for a specific debtor"""
    return debt_history.get_history(db, debtor_id, user.id)
