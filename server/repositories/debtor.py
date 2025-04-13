from sqlalchemy.orm import Session

from ..schemas import debtors
from ..models import models

def get_debtors(db: Session, user_id: int):
    return db.query(models.Debtor).filter(models.Debtor.user_id == user_id).all()

def get_debtor(db: Session, debtor_id: int, user_id: int):
    return db.query(models.Debtor).filter_by(id=debtor_id, user_id=user_id).first()

def create_debtor(db: Session, debtor: debtors.DebtorCreate, user_id: int):
    db_debtor = models.Debtor(**debtor.dict(), user_id=user_id)
    db.add(db_debtor)
    db.commit()
    db.refresh(db_debtor)
    return db_debtor

def update_debtor(db: Session, db_debtor: models.Debtor, update_data: debtors.DebtorUpdate):
    for field, value in update_data.dict().items():
        setattr(db_debtor, field, value)
    db.commit()
    db.refresh(db_debtor)
    return db_debtor

def delete_debtor(db: Session, db_debtor: models.Debtor):
    db.delete(db_debtor)
    db.commit()
