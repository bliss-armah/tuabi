from fastapi import APIRouter,Depends,status,HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from models import models
from database import get_db
from JWTtoken import create_access_token
from sqlalchemy.orm import Session
from hashing import Hash

router = APIRouter(
   tags=['Authentication']
)


@router.post('/login')
def login(request:OAuth2PasswordRequestForm=Depends(),db:Session=Depends(get_db)):
    user=db.query(models.User).filter(models.User.email == request.username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
        detail=f'invalid credentials')
    if not Hash.verify(user.password,request.password):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
        detail=f'incorrect password')
    token_data = create_access_token(data={"sub": user.email, "user_id": user.id})
    return {
        "token":token_data,
        "user":user,
    }