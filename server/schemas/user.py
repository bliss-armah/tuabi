from pydantic import BaseModel, EmailStr
from typing import List, Optional
from .debtor import Debtor  # Import to show related debtors if needed

# Shared properties
class UserBase(BaseModel):
    name: str
    email: EmailStr

# For user creation
class UserCreate(UserBase):
    password: str

# For user login (if needed)
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# What we return to the frontend
class UserOut(UserBase):
    id: int

    class Config:
        orm_mode = True

# If you want to show user's debtors too
class UserWithDebtors(UserOut):
    debtors: List[Debtor] = []
