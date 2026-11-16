from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
import jwt
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from logger_config import logging
from models import RefreshTokenTable, UserTable
from schemas import UserCreate, UserLogin
from security import SECRET_KEY, Algorithm, hash_password, hash_refresh_token,verify_password,create_access_token,create_refresh_token, verify_refresh_token



#Create a logger for the current python module
logger = logging.getLogger(__name__)
def register_user(user:UserCreate,db:Session):
# 1. Check whether the email already exists
    existing_user = db.query(UserTable).filter(
        UserTable.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail = "Email already registered"
        )
# 2. Hash the password before storing it
    hashed = hash_password(user.password)

# 3. Create a SQLAlchemy ORM object
    new_user = UserTable(
        username = user.username,
        email = user.email,
        hashed_password = hashed,
        role = "USER"
    )
 # 4. Save the user()
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail = "Email already registered"
        )
     # 5. Return the created user
    return new_user

def save_refresh_token(user_id,token_hash,expire_at,db):
    new_token = RefreshTokenTable(
        user_id=user_id,
        token_hash=token_hash,
        expire_at=expire_at,
        revoked_at=None
    )
    db.add(new_token)
    return new_token
    
def login_user(user:UserLogin,db:Session):
 # Find user by email
    existing_user = db.query(UserTable).filter(UserTable.email==user.email).first()

      # Reject unknown email
    if existing_user is None:
        logger.warning("Login failed: user not found")
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    logger.info("User exist in the table")
    # Verify password against stored hash
    is_valid = verify_password(
        user.password,
        existing_user.hashed_password
    )

    if not is_valid:
        logger.warning("Login failed: incorrect password")
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    logger.info("User's Password has verified and Generating tokens for user")

      # Generate JWT for authenticated user
    access_token = create_access_token(existing_user.id)
    refresh_token,expire_time = create_refresh_token(existing_user.id)
    payload = jwt.decode(
            refresh_token,
            SECRET_KEY,
            algorithms = [Algorithm]
            )
    token_hash = hash_refresh_token(refresh_token)
    
    new_token  = save_refresh_token(existing_user.id,token_hash,expire_time,db)
    try:
        db.commit()
        db.refresh(new_token)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
        status_code=409,
        detail="Refresh token conflicts with an existing record"
            )
    
    return {
        "access_token":access_token,
        "refresh_token":refresh_token,
        "token_type":"bearer"
    }


def generate_refresh_tokens(refresh_token:str,db:Session):
    #Verify the refresh token first
    user_id = verify_refresh_token(refresh_token)
    existing_user = db.get(UserTable,user_id)
    if existing_user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )
    refresh_token,expire_time = create_refresh_token(existing_user.id)
    payload = jwt.decode(
        refresh_token,
        SECRET_KEY,
        algorithms = [Algorithm]
        )
    token_hash = hash_refresh_token(refresh_token)

    new_token  = save_refresh_token(existing_user.id,token_hash,expire_time,db)
    try:
        db.commit()
        db.refresh(new_token)
   
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Refresh token conflicts with an existing record"
        )

    if existing_user is None:
        raise HTTPException(
            status_code=401,
            detail="User no longer exists"
        )
    



