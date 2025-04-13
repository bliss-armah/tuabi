from fastapi import FastAPI
from models import models
from database import engine
from routers import authentication,debtor,user


app = FastAPI()

models.Base.metadata.create_all(engine)

app.include_router(authentication.router)
app.include_router(user.router)
app.include_router(debtor.router)



