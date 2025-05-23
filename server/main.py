from fastapi import FastAPI
from models import models
from database import engine
from routers import authentication, debtor, user, debt_history
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

models.Base.metadata.create_all(engine)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(authentication.router)
app.include_router(user.router)
app.include_router(debtor.router)
app.include_router(debt_history.router)



