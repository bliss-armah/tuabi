from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime

from schemas import debtor
from models import models

def get_history(db: Session, debtor_id: int, user_id: int):
    """Get all history entries for a specific debtor"""
    # First verify the debtor belongs to this user
    db_debtor = db.query(models.Debtor).filter(
        models.Debtor.id == debtor_id, 
        models.Debtor.user_id == user_id
    ).first()
    
    if not db_debtor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Debtor not found"
        )
    
    # Return all history entries for this debtor
    return db.query(models.DebtHistory).filter(
        models.DebtHistory.debtor_id == debtor_id
    ).order_by(models.DebtHistory.timestamp.desc()).all()

def create_history_entry(db: Session, debtor_id: int, history_data: debtor.DebtHistoryCreate, user_id: int):
    """Create a new history entry and update the debtor's amount_owed"""
    # First verify the debtor belongs to this user
    db_debtor = db.query(models.Debtor).filter(
        models.Debtor.id == debtor_id, 
        models.Debtor.user_id == user_id
    ).first()
    
    if not db_debtor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Debtor not found"
        )
    
    # Determine the action type based on the amount
    action = "add" if history_data.amount_changed > 0 else "reduce"
    if db_debtor.amount_owed + history_data.amount_changed == 0:
        action = "settled"
    
    # Create the history entry
    db_history = models.DebtHistory(
        debtor_id=debtor_id,
        amount_changed=history_data.amount_changed,
        note=history_data.note,
        action=action,
        performed_by=user_id
    )
    
    # Update the debtor's amount_owed
    db_debtor.amount_owed += history_data.amount_changed
    
    # Save changes to database
    db.add(db_history)
    db.commit()
    db.refresh(db_history)
    
    return db_history
