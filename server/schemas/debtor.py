from pydantic import BaseModel, Field
from typing import Optional, List, Union
from datetime import datetime

class DebtHistoryBase(BaseModel):
    amount_changed: float
    note: Optional[str] = None

class DebtHistoryCreate(DebtHistoryBase):
    pass

class DebtHistory(DebtHistoryBase):
    id: int
    timestamp: datetime
    action: str  # 'add', 'reduce', 'settled'
    
    class Config:
        orm_mode = True

class DebtorBase(BaseModel):
    name: str
    amount_owed: float = 0.0
    description: Optional[str] = None
    phone_number: Optional[str] = None  # Added for calling feature

class DebtorCreate(DebtorBase):
    pass

class DebtorUpdate(DebtorBase):
    name: Optional[str] = None
    amount_owed: Optional[float] = None
    description: Optional[str] = None
    phone_number: Optional[str] = None

class Debtor(DebtorBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    history: List[DebtHistory] = []
    
    class Config:
        orm_mode = True

class DebtorSummary(BaseModel):
    total_debtors: int
    total_debt: float
    recent_activities: int

class TokenData(BaseModel):
    email: str | None = None