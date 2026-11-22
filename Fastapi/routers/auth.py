from fastapi import APIRouter,Depends,status
from sqlalchemy.orm import Session

from database import SessionLocal
from schemas import RefreshTokenRequest, UserCreate, UserLogin,UserResponse,TokenResponse
from services.auth_service import generate_refresh_tokens, login_user, logout_user, register_user


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)

# Creates a database session and closes it after the request finishes.
def get_db():
    db = SessionLocal()
    try:
        yield db

    finally:
        db.close()


# Receives registration data and delegates user creation to the auth service.
@router.post("/register",response_model=UserResponse,status_code=status.HTTP_201_CREATED)
def register(user:UserCreate,db:Session=Depends(get_db)):
    return register_user(user,db)

# Receives login credentials and delegates authentication to the auth service.
@router.post("/login",response_model=TokenResponse)
def login(user:UserLogin,db:Session=Depends(get_db)):
    return login_user(user,db)

# Uses a refresh token to issue a new access token.
@router.post("/refresh")
def refresh_access_token(
    request:RefreshTokenRequest,
    db:Session=Depends(get_db)
):
    return generate_refresh_tokens(request.refresh_token,db)
    
# Revokes the submitted refresh token and returns logout status.
@router.post("/logout")
def logout(request:RefreshTokenRequest,db:Session=Depends(get_db)
           ):
    return logout_user(request.refresh_token,db)

