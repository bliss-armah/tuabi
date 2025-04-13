from fastapi import APIRouter,Depends,status
from sqlalchemy.orm import Session

from database import get_db
from schemas.user import UserOut,UserCreate
from repositories import user



router = APIRouter(
    prefix='/user',
    tags=['Users']
)



@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(request: UserCreate, db: Session = Depends(get_db)):
    return user.create(request, db)

@router.get('/{id}',response_model=UserOut)
def get_user(id:int,db:Session=Depends(get_db)):
    return user.show(id,db)