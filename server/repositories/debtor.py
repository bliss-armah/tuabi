from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, status

from schemas import debtor
from models import models

def get_debtors(db: Session, user_id: int):
    return db.query(models.Debtor).filter(models.Debtor.user_id == user_id).all()

def get_debtor(db: Session, debtor_id: int, user_id: int):
    db_debtor =db.query(models.Debtor).filter_by(id=debtor_id, user_id=user_id).first()
    if not db_debtor:
        raise HTTPException(status_code=404, detail="Debtor not found")
    return db_debtor

def create_debtor(db: Session, debtor: debtor.DebtorCreate, user_id: int):
    db_debtor = models.Debtor(**debtor.dict(), user_id=user_id)
    db.add(db_debtor)
    db.commit()
    db.refresh(db_debtor)
    return db_debtor

def update_debtor(db: Session, debtor_id: int, user_id: int, update_data: debtor.DebtorUpdate):
    db_debtor = db.query(models.Debtor).filter(models.Debtor.id == debtor_id, models.Debtor.user_id == user_id).first()
    
    if not db_debtor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Debtor not found")
    
    for field, value in update_data.dict().items():
        setattr(db_debtor, field, value)
    db.commit()
    db.refresh(db_debtor)
    return db_debtor


def delete_debtor(db: Session, debtor_id: int, user_id: int):
    query = db.query(models.Debtor).filter(models.Debtor.id == debtor_id, models.Debtor.user_id == user_id)
    if not query.first():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Debtor with id {debtor_id} not found"
        )
    query.delete(synchronize_session=False)
    db.commit()
    return "Debtor deleted successfully"