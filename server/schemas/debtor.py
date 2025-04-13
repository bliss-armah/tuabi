from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class DebtHistoryBase(BaseModel):
    amount_changed: float
    note: Optional[str] = None

class DebtHistoryCreate(DebtHistoryBase):
    pass

class DebtHistory(DebtHistoryBase):
    id: int
    timestamp: datetime

class DebtorBase(BaseModel):
    name: str
    amount_owed: float = 0.0
    description: Optional[str] = None

class DebtorCreate(DebtorBase):
    pass

class DebtorUpdate(DebtorBase):
    pass

class Debtor(DebtorBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    history: List[DebtHistory] = []

class TokenData(BaseModel):
    email: str | None = None