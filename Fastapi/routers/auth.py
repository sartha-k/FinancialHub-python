from fastapi import APIRouter,Depends,status
from sqlalchemy.orm import Session

from database import SessionLocal
from schemas import RefreshTokenRequest, UserCreate, UserLogin,UserResponse,TokenResponse
from services.auth_service import generate_refresh_tokens, login_user, register_user


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db

    finally:
        db.close()


@router.post("/register",response_model=UserResponse,status_code=status.HTTP_201_CREATED)
def register(user:UserCreate,db:Session=Depends(get_db)):
    return register_user(user,db)

@router.post("/login",response_model=TokenResponse)
def login(user:UserLogin,db:Session=Depends(get_db)):
    return login_user(user,db)

@router.post("/refresh")
def refresh_access_token(
    request:RefreshTokenRequest,
    db:Session=Depends(get_db)
):
    return generate_refresh_tokens(request.refresh_token,db)
    

