from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends
from fastapi import HTTPException
from database import SessionLocal
from models import UserTable
from sqlalchemy.orm import Session
from security import verify_access_token
import logging

logger = logging.getLogger(__name__)

def get_db():
    db=SessionLocal()

    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl = "/api/auth/login"
)

def get_current_user(token:str = Depends(oauth2_scheme),db:Session=Depends(get_db)):
    logger.info("The token is %s",token)
    user_id = verify_access_token(token)
    existing_user = db.query(UserTable).filter(UserTable.id==user_id).first()

    if existing_user is None:
        raise HTTPException(status_code=401,detail="Invalid authentication credentials")

    return existing_user

def require_roles(allowed_roles):
    def check_roles(current_user:UserTable=Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Permission Denied")
        return current_user
    return check_roles