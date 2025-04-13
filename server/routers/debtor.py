from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from schemas.debtor import Debtor, DebtorCreate, DebtorUpdate
from repositories import debtor
from database import get_db
from oauth2 import get_current_user
from models import models

router = APIRouter(prefix="/debtors", tags=["Debtors"])

@router.get("/", response_model=List[Debtor])
def list_debtors(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return debtor.get_debtors(db, user.id)

@router.post("/", response_model=Debtor)
def create_debtor(request: DebtorCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return debtor.create_debtor(db, request, user.id)

@router.get("/{debtor_id}", response_model=Debtor)
def get_debtor(debtor_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return debtor.get_debtor(db, debtor_id, user.id)

@router.put("/{debtor_id}", response_model=Debtor)
def update_debtor(debtor_id: int, update: DebtorUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return debtor.update_debtor(db, debtor_id, user.id, update)

@router.delete("/{debtor_id}")
def delete_debtor(debtor_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return debtor.delete_debtor(db, debtor_id, user.id)
