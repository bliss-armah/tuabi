from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# Subscription Schemas
class SubscriptionBase(BaseModel):
    plan_type: str
    amount: float
    currency: str = "NGN"

class SubscriptionCreate(SubscriptionBase):
    user_id: int
    end_date: datetime
    paystack_subscription_id: Optional[str] = None
    paystack_customer_id: Optional[str] = None

class SubscriptionUpdate(BaseModel):
    status: Optional[str] = None
    end_date: Optional[datetime] = None

class SubscriptionResponse(SubscriptionBase):
    id: int
    user_id: int
    status: str
    start_date: datetime
    end_date: datetime
    paystack_subscription_id: Optional[str] = None
    paystack_customer_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Transaction Schemas
class TransactionBase(BaseModel):
    amount: float
    currency: str = "NGN"
    status: str
    payment_method: Optional[str] = None
    description: Optional[str] = None

class TransactionCreate(TransactionBase):
    user_id: int
    subscription_id: Optional[int] = None
    paystack_transaction_id: str
    paystack_reference: str
    transaction_metadata: Optional[str] = None

class TransactionUpdate(BaseModel):
    status: Optional[str] = None
    payment_method: Optional[str] = None
    transaction_metadata: Optional[str] = None

class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    subscription_id: Optional[int] = None
    paystack_transaction_id: str
    paystack_reference: str
    transaction_metadata: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Paystack Integration Schemas
class PaystackInitializeRequest(BaseModel):
    email: str
    amount: float
    plan_type: str  # monthly, yearly
    currency: str = "NGN"
    callback_url: Optional[str] = None

class PaystackInitializeResponse(BaseModel):
    status: bool
    message: str
    data: dict

class PaystackVerifyRequest(BaseModel):
    reference: str

class PaystackVerifyResponse(BaseModel):
    status: bool
    message: str
    data: dict

# Subscription Plan Schemas
class SubscriptionPlan(BaseModel):
    id: str
    name: str
    amount: float
    currency: str
    interval: str  # monthly, yearly
    description: Optional[str] = None

class UserSubscriptionStatus(BaseModel):
    is_subscribed: bool
    subscription_expires_at: Optional[datetime] = None
    current_plan: Optional[SubscriptionResponse] = None
    active_transactions: List[TransactionResponse] = [] 