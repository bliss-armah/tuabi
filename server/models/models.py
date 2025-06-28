from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, func, Boolean
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    is_subscribed = Column(Boolean, default=False)
    subscription_expires_at = Column(DateTime(timezone=True), nullable=True)

    debtors = relationship("Debtor", back_populates="owner")
    subscriptions = relationship("Subscription", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")


class Debtor(Base):
    __tablename__ = "debtors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # name of debtor
    amount_owed = Column(Float, default=0.0)  # how much they owe
    description = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)  # phone number for calling feature
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="debtors")

    history = relationship("DebtHistory", back_populates="debtor", cascade="all, delete-orphan")


class DebtHistory(Base):
    __tablename__ = "debt_history"

    id = Column(Integer, primary_key=True, index=True)
    debtor_id = Column(Integer, ForeignKey("debtors.id"))
    amount_changed = Column(Float)
    note = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    action = Column(String)  # e.g., "add", "reduce", "settled"
    performed_by = Column(Integer, ForeignKey("users.id"))  # track who made the update

    debtor = relationship("Debtor", back_populates="history")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    plan_type = Column(String, nullable=False)  # e.g., "monthly", "yearly"
    amount = Column(Float, nullable=False)
    currency = Column(String, default="NGN")
    status = Column(String, default="active")  # active, expired, cancelled
    start_date = Column(DateTime(timezone=True), server_default=func.now())
    end_date = Column(DateTime(timezone=True), nullable=False)
    paystack_subscription_id = Column(String, nullable=True)
    paystack_customer_id = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="subscriptions")
    transactions = relationship("Transaction", back_populates="subscription")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"), nullable=True)
    paystack_transaction_id = Column(String, unique=True, index=True)
    paystack_reference = Column(String, unique=True, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="NGN")
    status = Column(String, nullable=False)  # pending, success, failed, abandoned
    payment_method = Column(String, nullable=True)  # card, bank_transfer, etc.
    description = Column(String, nullable=True)
    transaction_metadata = Column(String, nullable=True)  # JSON string for additional data
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="transactions")
    subscription = relationship("Subscription", back_populates="transactions")
