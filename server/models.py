from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)

    debtors = relationship("Debtor", back_populates="owner")


class Debtor(Base):
    __tablename__ = "debtors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # name of debtor
    amount_owed = Column(Float, default=0.0)  # how much they owe
    description = Column(String, nullable=True)
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
