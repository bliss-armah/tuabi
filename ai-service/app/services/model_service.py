import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, accuracy_score, mean_squared_error
import joblib
import os
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
import logging

from app.database import db
from app.models.schemas import (
    DebtorRiskAssessment, PaymentPrediction, CashFlowPrediction,
    SmartRecommendation, RiskLevel, ModelStatus
)

logger = logging.getLogger(__name__)

class ModelService:
    def __init__(self):
        self.risk_model = None
        self.payment_model = None
        self.scaler = None
        self.label_encoder = None
        self.model_dir = "app/models/trained"
        self.is_initialized = False
        
        # Ensure model directory exists
        os.makedirs(self.model_dir, exist_ok=True)
    
    async def initialize(self):
        """Initialize models and load if they exist"""
        try:
            await self.load_models()
            
            # If models don't exist, train them
            if not self.risk_model or not self.payment_model:
                logger.info("Models not found, training new models...")
                await self.train_models()
            
            self.is_initialized = True
            logger.info("Model service initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing model service: {e}")
            raise
    
    def is_ready(self) -> bool:
        """Check if the service is ready"""
        return self.is_initialized and self.risk_model is not None and self.payment_model is not None
    
    async def load_models(self):
        """Load trained models from disk"""
        try:
            risk_model_path = f"{self.model_dir}/risk_model.joblib"
            payment_model_path = f"{self.model_dir}/payment_model.joblib"
            scaler_path = f"{self.model_dir}/scaler.joblib"
            
            if all(os.path.exists(path) for path in [risk_model_path, payment_model_path, scaler_path]):
                self.risk_model = joblib.load(risk_model_path)
                self.payment_model = joblib.load(payment_model_path)
                self.scaler = joblib.load(scaler_path)
                logger.info("Models loaded successfully")
            else:
                logger.info("Some model files not found")
        except Exception as e:
            logger.error(f"Error loading models: {e}")
    
    async def save_models(self):
        """Save trained models to disk"""
        try:
            joblib.dump(self.risk_model, f"{self.model_dir}/risk_model.joblib")
            joblib.dump(self.payment_model, f"{self.model_dir}/payment_model.joblib")
            joblib.dump(self.scaler, f"{self.model_dir}/scaler.joblib")
            logger.info("Models saved successfully")
        except Exception as e:
            logger.error(f"Error saving models: {e}")
    
    async def train_models(self):
        """Train all ML models"""
        try:
            # Fetch training data
            training_data = await db.fetch_all_debtors_for_training()
            
            if len(training_data) < 10:
                logger.warning("Insufficient training data, creating synthetic data for demo")
                training_data = self._generate_synthetic_data()
            
            df = pd.DataFrame(training_data)
            
            # Prepare features and train models
            await self._train_risk_model(df)
            await self._train_payment_model(df)
            
            # Save models
            await self.save_models()
            
            logger.info("Models trained successfully")
        except Exception as e:
            logger.error(f"Error training models: {e}")
            raise
    
    def _generate_synthetic_data(self) -> List[Dict[str, Any]]:
        """Generate synthetic data for demonstration purposes"""
        np.random.seed(42)
        synthetic_data = []
        
        for i in range(100):
            # Generate realistic debt patterns
            days_since_creation = np.random.randint(1, 730)
            payment_count = max(1, np.random.poisson(3))
            total_added = np.random.uniform(100, 5000)
            total_paid = np.random.uniform(0, total_added * 1.2)
            amount_owed = max(0, total_added - total_paid)
            
            synthetic_data.append({
                'id': i + 1,
                'amountOwed': amount_owed,
                'days_since_creation': days_since_creation,
                'payment_count': payment_count,
                'total_paid': total_paid,
                'total_added': total_added,
                'avg_payment': total_paid / payment_count if payment_count > 0 else 0,
                'payment_span_days': max(1, np.random.randint(1, days_since_creation)),
                'status': 'settled' if amount_owed == 0 else 'active'
            })
        
        logger.info(f"Generated {len(synthetic_data)} synthetic records for training")
        return synthetic_data
    
    async def _train_risk_model(self, df: pd.DataFrame):
        """Train the risk assessment model"""
        # Create risk labels based on payment behavior
        df['risk_label'] = df.apply(self._calculate_risk_label, axis=1)
        
        # Prepare features
        feature_columns = [
            'amountOwed', 'days_since_creation', 'payment_count',
            'total_paid', 'total_added', 'avg_payment', 'payment_span_days'
        ]
        
        X = df[feature_columns].fillna(0)
        y = df['risk_label']
        
        # Handle case where we might not have all risk levels
        if len(y.unique()) == 1:
            # Add some variation for training
            y.iloc[0] = 'medium' if y.iloc[0] != 'medium' else 'high'
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Scale features
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        self.risk_model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.risk_model.fit(X_train_scaled, y_train)
        
        # Evaluate
        y_pred = self.risk_model.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, y_pred)
        logger.info(f"Risk model trained with accuracy: {accuracy:.2f}")
    
    async def _train_payment_model(self, df: pd.DataFrame):
        """Train the payment prediction model"""
        # Create payment likelihood target (0-1 based on payment behavior)
        df['payment_likelihood'] = df.apply(self._calculate_payment_likelihood, axis=1)
        
        feature_columns = [
            'amountOwed', 'days_since_creation', 'payment_count',
            'total_paid', 'avg_payment', 'payment_span_days'
        ]
        
        X = df[feature_columns].fillna(0)
        y = df['payment_likelihood']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Use the same scaler
        X_train_scaled = self.scaler.transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        self.payment_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.payment_model.fit(X_train_scaled, y_train)
        
        # Evaluate
        y_pred = self.payment_model.predict(X_test_scaled)
        mse = mean_squared_error(y_test, y_pred)
        logger.info(f"Payment model trained with MSE: {mse:.4f}")
    
    def _calculate_risk_label(self, row) -> str:
        """Calculate risk label based on payment behavior"""
        if row['status'] == 'settled':
            return 'low'
        
        payment_ratio = row['total_paid'] / row['total_added'] if row['total_added'] > 0 else 0
        avg_days_between_payments = row['payment_span_days'] / max(1, row['payment_count'])
        
        if payment_ratio > 0.8 and avg_days_between_payments < 30:
            return 'low'
        elif payment_ratio > 0.5 and avg_days_between_payments < 60:
            return 'medium'
        else:
            return 'high'
    
    def _calculate_payment_likelihood(self, row) -> float:
        """Calculate payment likelihood score (0-1)"""
        if row['status'] == 'settled':
            return 0.1  # Low likelihood of further payments
        
        payment_ratio = row['total_paid'] / row['total_added'] if row['total_added'] > 0 else 0
        payment_frequency = row['payment_count'] / max(1, row['days_since_creation'] / 30)
        
        # Combine factors
        likelihood = (payment_ratio * 0.6) + (min(payment_frequency, 1.0) * 0.4)
        return min(max(likelihood, 0.1), 0.9)  # Keep between 0.1 and 0.9
    
    async def assess_risk(self, user_id: int, debtor_id: Optional[int] = None) -> List[DebtorRiskAssessment]:
        """Assess risk for user's debtors"""
        if not self.is_ready():
            raise ValueError("Models not ready")
        
        debtors_data = await db.fetch_user_debtors_data(user_id)
        
        if debtor_id:
            debtors_data = [d for d in debtors_data if d['id'] == debtor_id]
        
        assessments = []
        
        for debtor in debtors_data:
            features = self._extract_features_for_debtor(debtor)
            features_scaled = self.scaler.transform([features])
            
            # Predict risk
            risk_proba = self.risk_model.predict_proba(features_scaled)[0]
            risk_classes = self.risk_model.classes_
            risk_score = max(risk_proba)
            risk_level = risk_classes[np.argmax(risk_proba)]
            
            # Generate risk factors
            factors = self._generate_risk_factors(debtor, features)
            
            assessments.append(DebtorRiskAssessment(
                debtor_id=debtor['id'],
                risk_level=RiskLevel(risk_level),
                risk_score=float(risk_score),
                confidence=float(risk_score),
                factors=factors
            ))
        
        return assessments
    
    async def predict_payments(self, user_id: int, debtor_id: Optional[int] = None) -> List[PaymentPrediction]:
        """Predict payment likelihood and timing"""
        if not self.is_ready():
            raise ValueError("Models not ready")
        
        debtors_data = await db.fetch_user_debtors_data(user_id)
        
        if debtor_id:
            debtors_data = [d for d in debtors_data if d['id'] == debtor_id]
        
        predictions = []
        
        for debtor in debtors_data:
            if debtor['amountOwed'] <= 0:
                continue  # Skip settled debtors
            
            features = self._extract_features_for_debtor(debtor)
            features_scaled = self.scaler.transform([features])
            
            # Predict payment likelihood
            likelihood = self.payment_model.predict(features_scaled)[0]
            
            # Estimate next payment date based on historical patterns
            predicted_date = self._estimate_next_payment_date(debtor)
            predicted_amount = self._estimate_payment_amount(debtor)
            
            predictions.append(PaymentPrediction(
                debtor_id=debtor['id'],
                predicted_payment_date=predicted_date,
                prediction_confidence=float(likelihood),
                predicted_amount=predicted_amount,
                likelihood_of_payment=float(likelihood)
            ))
        
        return predictions
    
    def _extract_features_for_debtor(self, debtor: Dict[str, Any]) -> List[float]:
        """Extract features from debtor data"""
        history = debtor.get('history', [])
        
        # Calculate derived features
        days_since_creation = (datetime.now() - debtor['createdAt']).days
        payment_count = len([h for h in history if h['action'] == 'reduce'])
        total_paid = sum(h['amountChanged'] for h in history if h['action'] == 'reduce')
        total_added = sum(h['amountChanged'] for h in history if h['action'] == 'add')
        avg_payment = total_paid / payment_count if payment_count > 0 else 0
        
        # Calculate payment span
        payment_dates = [h['timestamp'] for h in history if h['action'] == 'reduce']
        payment_span_days = 0
        if len(payment_dates) > 1:
            payment_span_days = (max(payment_dates) - min(payment_dates)).days
        
        return [
            float(debtor['amountOwed']),
            float(days_since_creation),
            float(payment_count),
            float(total_paid),
            float(total_added),
            float(avg_payment),
            float(payment_span_days)
        ]
    
    def _generate_risk_factors(self, debtor: Dict[str, Any], features: List[float]) -> List[str]:
        """Generate human-readable risk factors"""
        factors = []
        amount_owed, days_since_creation, payment_count = features[0], features[1], features[2]
        
        if amount_owed > 1000:
            factors.append("High outstanding amount")
        if days_since_creation > 90 and payment_count == 0:
            factors.append("No payments in over 90 days")
        if payment_count > 0 and features[4] > 0:  # total_added > 0
            payment_ratio = features[3] / features[4]  # total_paid / total_added
            if payment_ratio < 0.3:
                factors.append("Low payment-to-debt ratio")
        if payment_count < 2 and days_since_creation > 30:
            factors.append("Infrequent payment history")
        
        return factors or ["Standard risk profile"]
    
    def _estimate_next_payment_date(self, debtor: Dict[str, Any]) -> Optional[datetime]:
        """Estimate next payment date based on historical patterns"""
        history = debtor.get('history', [])
        payment_history = [h for h in history if h['action'] == 'reduce']
        
        if len(payment_history) < 2:
            # Default to 30 days if no pattern
            return datetime.now() + timedelta(days=30)
        
        # Calculate average days between payments
        payment_dates = sorted([h['timestamp'] for h in payment_history])
        intervals = []
        for i in range(1, len(payment_dates)):
            interval = (payment_dates[i] - payment_dates[i-1]).days
            intervals.append(interval)
        
        avg_interval = sum(intervals) / len(intervals) if intervals else 30
        last_payment = payment_dates[-1]
        
        return last_payment + timedelta(days=avg_interval)
    
    def _estimate_payment_amount(self, debtor: Dict[str, Any]) -> Optional[float]:
        """Estimate likely payment amount"""
        history = debtor.get('history', [])
        payments = [h['amountChanged'] for h in history if h['action'] == 'reduce']
        
        if not payments:
            return min(debtor['amountOwed'] * 0.3, 500)  # Default estimate
        
        avg_payment = sum(payments) / len(payments)
        return min(avg_payment, debtor['amountOwed'])
    
    async def generate_recommendations(self, user_id: int) -> List[SmartRecommendation]:
        """Generate smart recommendations for debt management"""
        debtors_data = await db.fetch_user_debtors_data(user_id)
        risk_assessments = await self.assess_risk(user_id)
        payment_predictions = await self.predict_payments(user_id)
        
        recommendations = []
        
        for debtor in debtors_data:
            if debtor['amountOwed'] <= 0:
                continue
            
            # Find corresponding risk and prediction
            risk = next((r for r in risk_assessments if r.debtor_id == debtor['id']), None)
            prediction = next((p for p in payment_predictions if p.debtor_id == debtor['id']), None)
            
            if risk and risk.risk_level == RiskLevel.HIGH:
                recommendations.append(SmartRecommendation(
                    debtor_id=debtor['id'],
                    recommendation_type="urgent_follow_up",
                    message=f"High-risk debtor: {debtor['name']} needs immediate attention",
                    priority=5,
                    suggested_action="Call or visit in person",
                    optimal_time=datetime.now() + timedelta(hours=24)
                ))
            
            if prediction and prediction.likelihood_of_payment > 0.7:
                recommendations.append(SmartRecommendation(
                    debtor_id=debtor['id'],
                    recommendation_type="payment_opportunity",
                    message=f"{debtor['name']} has high payment likelihood",
                    priority=3,
                    suggested_action="Send gentle reminder",
                    optimal_time=prediction.predicted_payment_date
                ))
        
        return recommendations
    
    async def predict_cash_flow(self, user_id: int) -> CashFlowPrediction:
        """Predict future cash flows"""
        payment_predictions = await self.predict_payments(user_id)
        
        # Group predictions by month
        monthly_predictions = {}
        total_expected = 0
        
        for prediction in payment_predictions:
            if prediction.predicted_payment_date and prediction.predicted_amount:
                month_key = prediction.predicted_payment_date.strftime("%Y-%m")
                if month_key not in monthly_predictions:
                    monthly_predictions[month_key] = 0
                
                expected_amount = prediction.predicted_amount * prediction.likelihood_of_payment
                monthly_predictions[month_key] += expected_amount
                total_expected += expected_amount
        
        # Convert to list format
        predictions = [
            {"month": month, "expected_amount": amount}
            for month, amount in sorted(monthly_predictions.items())
        ]
        
        return CashFlowPrediction(
            user_id=user_id,
            predictions=predictions,
            total_expected=total_expected,
            confidence_interval={"low": total_expected * 0.7, "high": total_expected * 1.3}
        )
    
    async def cleanup(self):
        """Cleanup resources"""
        self.is_initialized = False
        logger.info("Model service cleaned up") 