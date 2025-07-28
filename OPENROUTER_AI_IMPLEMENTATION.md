# OpenRouter AI Implementation for Tuabi

## Overview

This implementation replaces the complex Python ML service with a simple, powerful OpenRouter integration that provides AI analysis for debt management using your existing database.

## Features

### 🤖 AI Analysis Capabilities

- **Portfolio Insights**: Comprehensive analysis of debt portfolio
- **Risk Assessment**: Individual debtor and portfolio risk evaluation
- **Payment Predictions**: AI-powered payment timing and amount predictions
- **Smart Recommendations**: Actionable recommendations for debt management
- **Cash Flow Forecasting**: Predictions for future cash inflows

### 🎯 Key Benefits

- **Simple Setup**: No complex ML models or Python dependencies
- **Real-time Analysis**: Uses your actual database data
- **Cost Effective**: Pay-per-use with OpenRouter
- **Scalable**: Handles any amount of data
- **Reliable**: No model training or maintenance required

## Setup

### 1. Get OpenRouter API Key

1. Sign up at [OpenRouter.ai](https://openrouter.ai)
2. Get your API key from the dashboard
3. Add to your environment variables

### 2. Environment Variables

```bash
# Add to your .env file or docker-compose.yml
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 3. API Endpoints

#### Get User Insights

```http
GET /api/ai/insights
Authorization: Bearer <jwt_token>
```

#### Get Debtor Analysis

```http
GET /api/ai/debtor/:debtorId/analysis
Authorization: Bearer <jwt_token>
```

#### Get Payment Predictions

```http
GET /api/ai/predictions
Authorization: Bearer <jwt_token>
```

#### Get Risk Assessment

```http
GET /api/ai/risk-assessment
Authorization: Bearer <jwt_token>
```

#### Get Comprehensive Analysis

```http
GET /api/ai/comprehensive
Authorization: Bearer <jwt_token>
```

## How It Works

### 1. Data Collection

The service queries your existing database using Prisma:

- Fetches debtor information with payment history
- Calculates payment statistics and patterns
- Gathers portfolio-level metrics

### 2. AI Analysis

Data is sent to OpenRouter (Claude 3.5 Sonnet) with structured prompts:

- Portfolio analysis with payment trends
- Risk assessment based on payment behavior
- Payment prediction using historical patterns
- Smart recommendations for debt management

### 3. Response Processing

AI responses are parsed and returned as structured JSON:

- Risk levels (low/medium/high)
- Payment likelihood scores
- Actionable recommendations
- Cash flow predictions

## Example AI Analysis

### Portfolio Insights Response

```json
{
  "totalDebtors": 15,
  "totalAmountOwed": 25000,
  "averageDebtPerDebtor": 1666.67,
  "highRiskDebtors": 3,
  "paymentTrends": "Strong payment activity in the last 30 days with 80% of debtors making payments",
  "recommendations": [
    "Focus on the 3 high-risk debtors with overdue payments",
    "Consider payment plans for debtors with large outstanding amounts",
    "Send reminders to debtors who haven't paid in 60+ days"
  ],
  "cashFlowPrediction": {
    "nextMonth": 8500,
    "nextThreeMonths": 22000,
    "confidence": "medium"
  }
}
```

### Debtor Analysis Response

```json
{
  "debtorId": 1,
  "name": "John Smith",
  "amountOwed": 1500,
  "riskLevel": "medium",
  "riskFactors": [
    "No payments in the last 45 days",
    "Payment history shows irregular patterns"
  ],
  "paymentLikelihood": 0.65,
  "recommendedActions": [
    "Send a friendly reminder call",
    "Offer a payment plan option",
    "Schedule a follow-up in 2 weeks"
  ],
  "nextPaymentPrediction": {
    "date": "2024-01-15",
    "amount": 500,
    "confidence": 0.75
  }
}
```

## Frontend Integration

The React Native app includes:

- **AIInsightsCard**: Displays portfolio insights and recommendations
- **DebtorRiskBadge**: Shows risk level for individual debtors
- **Real-time Updates**: AI analysis refreshes with data changes

## Cost Analysis

### OpenRouter Pricing (Claude 3.5 Sonnet)

- **Input**: $3.50 per 1M tokens
- **Output**: $15.00 per 1M tokens

### Typical Usage

- **Portfolio Analysis**: ~500 tokens per request
- **Debtor Analysis**: ~300 tokens per request
- **Monthly Cost**: ~$0.01-0.05 per user (depending on usage)

## Error Handling

The service includes robust error handling:

- **API Key Missing**: Graceful degradation with user-friendly messages
- **Network Issues**: Retry mechanisms and fallback responses
- **Invalid Data**: Validation and sanitization of AI responses
- **Rate Limiting**: Proper handling of OpenRouter rate limits

## Security

- **Authentication Required**: All AI endpoints require JWT authentication
- **Data Privacy**: Only user's own data is analyzed
- **API Key Protection**: Secure storage in environment variables
- **Input Validation**: All data is validated before sending to AI

## Monitoring

Monitor AI usage through:

- **OpenRouter Dashboard**: Track API usage and costs
- **Application Logs**: Monitor AI request success/failure rates
- **User Feedback**: Track which AI features are most valuable

## Future Enhancements

Potential improvements:

- **Caching**: Cache AI responses to reduce API calls
- **Batch Processing**: Analyze multiple debtors in single request
- **Custom Prompts**: Allow users to customize AI analysis focus
- **Historical Tracking**: Store AI insights for trend analysis
- **Integration**: Connect with reminder and notification systems

## Troubleshooting

### Common Issues

1. **"OpenRouter API key not configured"**

   - Check environment variable is set correctly
   - Restart the application after adding the key

2. **"Failed to get AI analysis"**

   - Check OpenRouter API key is valid
   - Verify network connectivity
   - Check OpenRouter service status

3. **"Invalid AI response format"**
   - AI response parsing failed
   - Check OpenRouter API response format
   - Review prompt structure

### Debug Mode

Enable debug logging by setting:

```bash
LOG_LEVEL=debug
```

This will show detailed AI request/response logs for troubleshooting.
