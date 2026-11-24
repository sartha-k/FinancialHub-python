from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends
from fastapi import HTTPException
from database import SessionLocal
from models import UserTable
from sqlalchemy.orm import Session
from security import verify_access_token
import logging

logger = logging.getLogger(__name__)

# Creates a database session and closes it after the request finishes.
def get_db():
    db=SessionLocal()

    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl = "/api/auth/login"
)

# Decodes the bearer token and retrieves the authenticated database user.
def get_current_user(token:str = Depends(oauth2_scheme),db:Session=Depends(get_db)):
    user_id = verify_access_token(token)
    existing_user = db.query(UserTable).filter(UserTable.id==user_id).first()

    if existing_user is None:
        logger.warning("Authentication failed: token refers to no existing user")
        raise HTTPException(status_code=401,detail="Invalid authentication credentials")

    logger.info("Authenticated user id=%s", existing_user.id)
    return existing_user
#closure function to check if the current user has one of the allowed roles
def require_roles(allowed_roles):
    # Rejects requests when the authenticated user lacks an allowed role.
    def check_roles(current_user:UserTable=Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            logger.warning("Authorization denied for user id=%s role=%s", current_user.id, current_user.role)
            raise HTTPException(status_code=403, detail="Permission Denied")
        logger.info("Authorization granted to user id=%s for roles=%s", current_user.id, allowed_roles)
        return current_user
    return check_roles