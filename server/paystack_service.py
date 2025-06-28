import requests
import os
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

class PaystackService:
    def __init__(self):
        self.secret_key = os.getenv("PAYSTACK_SECRET_KEY", "sk_test_...")  # Replace with your actual secret key
        self.public_key = os.getenv("PAYSTACK_PUBLIC_KEY", "pk_test_...")  # Replace with your actual public key
        self.base_url = "https://api.paystack.co"
        
    def _get_headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }
    
    def initialize_transaction(self, email: str, amount: float, reference: str, 
                             callback_url: Optional[str] = None, transaction_metadata: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Initialize a Paystack transaction
        """
        url = f"{self.base_url}/transaction/initialize"
        
        payload = {
            "email": email,
            "amount": int(amount * 100),  # Paystack expects amount in kobo (smallest currency unit)
            "reference": reference,
            "currency": "NGN"
        }
        
        if callback_url:
            payload["callback_url"] = callback_url
            
        if transaction_metadata:
            payload["transaction_metadata"] = transaction_metadata
            
        try:
            response = requests.post(url, json=payload, headers=self._get_headers())
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Paystack API error: {str(e)}")
    
    def verify_transaction(self, reference: str) -> Dict[str, Any]:
        """
        Verify a Paystack transaction
        """
        url = f"{self.base_url}/transaction/verify/{reference}"
        
        try:
            response = requests.get(url, headers=self._get_headers())
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Paystack API error: {str(e)}")
    
    def create_customer(self, email: str, first_name: str, last_name: str, phone: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a Paystack customer
        """
        url = f"{self.base_url}/customer"
        
        payload = {
            "email": email,
            "first_name": first_name,
            "last_name": last_name
        }
        
        if phone:
            payload["phone"] = phone
            
        try:
            response = requests.post(url, json=payload, headers=self._get_headers())
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Paystack API error: {str(e)}")
    
    def create_subscription(self, customer_id: str, plan_code: str, start_date: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a Paystack subscription
        """
        url = f"{self.base_url}/subscription"
        
        payload = {
            "customer": customer_id,
            "plan": plan_code
        }
        
        if start_date:
            payload["start_date"] = start_date
            
        try:
            response = requests.post(url, json=payload, headers=self._get_headers())
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Paystack API error: {str(e)}")
    
    def get_subscription_plans(self) -> Dict[str, Any]:
        """
        Get available subscription plans from Paystack
        """
        url = f"{self.base_url}/plan"
        
        try:
            response = requests.get(url, headers=self._get_headers())
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Paystack API error: {str(e)}")
    
    def create_plan(self, name: str, amount: float, interval: str, description: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a subscription plan in Paystack
        """
        url = f"{self.base_url}/plan"
        
        payload = {
            "name": name,
            "amount": int(amount * 100),  # Convert to kobo
            "interval": interval,
            "currency": "NGN"
        }
        
        if description:
            payload["description"] = description
            
        try:
            response = requests.post(url, json=payload, headers=self._get_headers())
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Paystack API error: {str(e)}")

# Initialize the service
paystack_service = PaystackService()

# Default subscription plans
DEFAULT_PLANS = {
    "monthly": {
        "name": "Monthly Plan",
        "amount": 1000.0,  # 1000 NGN
        "interval": "monthly",
        "description": "Access to all features for 1 month"
    },
    "yearly": {
        "name": "Yearly Plan", 
        "amount": 10000.0,  # 10000 NGN
        "interval": "yearly",
        "description": "Access to all features for 1 year (Save 20%)"
    }
} 