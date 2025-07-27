# Tuabi AI Service

## Overview

The Tuabi AI Service is a Python FastAPI-based microservice that provides intelligent debt analysis and predictions for the Tuabi debt tracking application. It uses machine learning models to offer risk assessment, payment predictions, cash flow forecasting, and smart recommendations.

## Features

### 🔍 Risk Assessment

- Classifies debtors into risk categories (Low, Medium, High)
- Analyzes payment behavior patterns
- Provides risk factors and confidence scores

### 📈 Payment Predictions

- Predicts when debtors are likely to make payments
- Estimates payment amounts based on historical data
- Calculates payment likelihood scores

### 💰 Cash Flow Forecasting

- Predicts future cash flows based on payment patterns
- Provides monthly projections with confidence intervals
- Helps with financial planning

### 🎯 Smart Recommendations

- Generates actionable insights for debt management
- Suggests optimal times for follow-ups
- Prioritizes recommendations by urgency

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │    Node.js      │    │   Python AI     │
│    Frontend     │◄──►│    Backend      │◄──►│    Service      │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                              ┌─────────▼─────────┐
                                              │   PostgreSQL      │
                                              │   Database        │
                                              └───────────────────┘
```

## Technology Stack

- **Framework**: FastAPI
- **ML Libraries**: scikit-learn, pandas, numpy
- **Database**: PostgreSQL (via asyncpg)
- **Deployment**: Docker
- **API Documentation**: Auto-generated OpenAPI/Swagger

## Installation & Setup

### Prerequisites

- Python 3.11+
- PostgreSQL database (shared with main app)
- Docker (optional)

### Local Development

1. **Clone and navigate to AI service**:

   ```bash
   cd ai-service
   ```

2. **Create virtual environment**:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env with your database connection details
   ```

5. **Run the service**:
   ```bash
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Docker Deployment

The AI service is configured to run with Docker Compose alongside the main application:

```bash
# From project root
docker-compose up ai-service
```

## API Endpoints

### Health Check

- `GET /health` - Service health and model status

### Predictions

- `GET /api/v1/predictions/risk-assessment/{user_id}` - Risk assessment for user's debtors
- `GET /api/v1/predictions/payment-predictions/{user_id}` - Payment predictions
- `GET /api/v1/predictions/cash-flow/{user_id}` - Cash flow forecast

### Insights

- `GET /api/v1/insights/recommendations/{user_id}` - Smart recommendations
- `GET /api/v1/insights/comprehensive-analysis/{user_id}` - Complete AI analysis
- `POST /api/v1/insights/retrain-models` - Retrain ML models

### Admin

- `GET /api/v1/insights/model-status` - Model training status and metrics

## Machine Learning Models

### Risk Assessment Model

- **Algorithm**: Random Forest Classifier
- **Features**: Amount owed, payment history, time patterns, debt-to-payment ratios
- **Output**: Risk level (low/medium/high) with confidence score

### Payment Prediction Model

- **Algorithm**: Random Forest Regressor
- **Features**: Historical payment patterns, debtor behavior, seasonal factors
- **Output**: Payment likelihood score and estimated timing

### Training Data

- Models are trained on anonymized debt and payment history data
- Automatic synthetic data generation for demo environments
- Retraining capability for production data updates

## Integration with Main Application

### Backend Integration

The Node.js backend includes an AI service client (`server/src/services/aiService.ts`) that:

- Handles communication with the AI service
- Provides health checking and error handling
- Exposes AI endpoints through the main API

### Frontend Integration

The React Native frontend includes:

- AI API hooks for data fetching
- AI insights dashboard components
- Risk badges and prediction displays

## Configuration

### Environment Variables

```bash
DATABASE_URL=postgresql://user:password@host:port/database
PORT=8000
LOG_LEVEL=INFO
MODEL_RETRAIN_INTERVAL_HOURS=24
MIN_TRAINING_SAMPLES=10
```

### Model Configuration

- Models are automatically saved and loaded from `app/models/trained/`
- Training occurs on startup if models don't exist
- Synthetic data generation for development/demo environments

## Usage Examples

### Getting AI Insights

```bash
# Get comprehensive analysis for user
curl "http://localhost:8000/api/v1/insights/comprehensive-analysis/1"

# Get risk assessment only
curl "http://localhost:8000/api/v1/predictions/risk-assessment/1"
```

### Response Example

```json
{
  "user_id": 1,
  "risk_assessments": [
    {
      "debtor_id": 5,
      "risk_level": "high",
      "risk_score": 0.85,
      "confidence": 0.78,
      "factors": ["High outstanding amount", "No payments in over 90 days"]
    }
  ],
  "payment_predictions": [
    {
      "debtor_id": 5,
      "predicted_payment_date": "2024-02-15T00:00:00",
      "likelihood_of_payment": 0.65,
      "predicted_amount": 250.0
    }
  ],
  "recommendations": [
    {
      "debtor_id": 5,
      "recommendation_type": "urgent_follow_up",
      "message": "High-risk debtor needs immediate attention",
      "priority": 5,
      "suggested_action": "Call or visit in person"
    }
  ]
}
```

## Development

### Adding New Features

1. Create new endpoint in `app/routers/`
2. Implement business logic in `app/services/model_service.py`
3. Add corresponding types in `app/models/schemas.py`
4. Update frontend API client and components

### Testing

```bash
# Run tests (when implemented)
pytest tests/

# Check API documentation
open http://localhost:8000/docs
```

### Model Improvement

- Add new features to model training pipeline
- Experiment with different algorithms
- Implement cross-validation and hyperparameter tuning
- Add model performance monitoring

## Deployment

### Production Considerations

- Use production database with real data
- Implement proper logging and monitoring
- Set up model retraining schedules
- Configure proper security and authentication
- Use environment-specific configurations

### Scaling

- The service is stateless and can be horizontally scaled
- Consider model serving optimization for high loads
- Implement caching for frequently requested predictions

## Contributing

1. Follow Python best practices and PEP 8
2. Add type hints to all functions
3. Update schemas when adding new features
4. Test thoroughly with different data scenarios
5. Update documentation for new endpoints

## License

Part of the Tuabi project - see main project license.
