from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import os
from dotenv import load_dotenv

from app.routers import predictions, insights
from app.services.model_service import ModelService
from app.database import init_db

load_dotenv()

# Global model service instance
model_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global model_service
    await init_db()
    model_service = ModelService()
    await model_service.initialize()
    
    yield
    
    # Shutdown
    if model_service:
        await model_service.cleanup()

app = FastAPI(
    title="Tuabi AI Service",
    description="AI-powered debt analysis and predictions for Tuabi debt tracking app",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(predictions.router, prefix="/api/v1/predictions", tags=["predictions"])
app.include_router(insights.router, prefix="/api/v1/insights", tags=["insights"])

@app.get("/")
async def root():
    return {"message": "Tuabi AI Service is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model_service is not None and model_service.is_ready()
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    ) 