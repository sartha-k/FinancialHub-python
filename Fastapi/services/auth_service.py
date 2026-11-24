from datetime import datetime, timedelta, timezone
import time
from fastapi import HTTPException
import jwt
import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from models import RefreshTokenTable, UserTable
from schemas import UserCreate, UserLogin
from security import SECRET_KEY, Algorithm, hash_password, hash_refresh_token,verify_password,create_access_token,create_refresh_token, verify_refresh_token



#Create a logger for the current python module for the purpose of logging events and errors
logger = logging.getLogger(__name__)
# Validates registration details and creates a new user record.
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
        logger.info("User registered successfully id=%s email=%s", new_user.id, new_user.email)
    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail = "Email already registered"
        )
     # 5. Return the created user
    return new_user

# Stores a hashed refresh token and its expiration for a user.
def save_refresh_token(user_id,token_hash,expire_at,db):
    new_token = RefreshTokenTable(
        user_id=user_id,
        token_hash=token_hash,
        expire_at=expire_at,
        revoked_at=None
    )
    db.add(new_token)
    return new_token
    
# Authenticates a user and issues a new access/refresh token pair.
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


# Validates a refresh token and issues a replacement token pair.
def generate_refresh_tokens(refresh_token:str,db:Session):
    #Verify the refresh token first
    user_id = verify_refresh_token(refresh_token)
    #check user
    existing_user = db.get(UserTable,user_id)

    if existing_user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )
    #Hashing R1
    token_hash = hash_refresh_token(refresh_token)

    #find R1 in Mysql
    token_record = db.query(RefreshTokenTable).filter(
            RefreshTokenTable.token_hash == token_hash,
            RefreshTokenTable.user_id == existing_user.id
        ).first()
    if token_record is None:
            raise HTTPException(
            status_code=401,
            detail="Invalid refresh token"
        )
    current_time = datetime.now(timezone.utc).replace(tzinfo=None)
    if token_record.revoked_at is not None:
            raise HTTPException(
                status_code=401,
                detail="Refresh token has been revoked"
            )
    if token_record.expire_at <=current_time:
            raise HTTPException(
                status_code=401,
                detail="Refresh token has expired"
            )    
    #Revoke R1
    updated_rows = (
         db.query(RefreshTokenTable)
         .filter(
              RefreshTokenTable.id == token_record.id,
              RefreshTokenTable.revoked_at.is_(None),
              RefreshTokenTable.expire_at > current_time
         )
         .update(
              {RefreshTokenTable.revoked_at:current_time},
              synchronize_session=False
         )
         )
    logger.info("Refresh token rotation revoked rows=%s user_id=%s", updated_rows, existing_user.id)
    if updated_rows!=1:
         db.rollback()
         raise HTTPException(
              status_code=401,
              detail="Refresh token already used or expired -- Experienced Race Condition"
         )
    # Generate new refresh token R2
    access_token = create_access_token(existing_user.id)

    new_refresh_token,expire_time = create_refresh_token(existing_user.id)
    new_token_hash = hash_refresh_token(new_refresh_token)
    
    
    new_token  = save_refresh_token(existing_user.id,new_token_hash,expire_time,db)
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
    return {
        "access_token":access_token,
        "refresh_token":new_refresh_token,
        "token_type":"bearer"

    }


    
# Revokes a refresh token so it can no longer be reused.
def logout_user(refresh_token:str,db:Session)->str:
    logger.info("Processing refresh-token logout")
    user_id = verify_refresh_token(refresh_token)
    existing_user = db.get(UserTable,user_id)

    if existing_user is None:
         raise HTTPException(
              status_code=404,
              detail="user not found"
         )
    hash_token = hash_refresh_token(refresh_token)
    token_record = db.query(RefreshTokenTable).filter(RefreshTokenTable.token_hash==hash_token).first()
    if token_record is None:
         raise HTTPException(
              status_code=401,
              detail="User is unauthorised"
         )
    current_time = datetime.now(timezone.utc).replace(tzinfo=None)
    update_rows = db.query(RefreshTokenTable).filter(
         RefreshTokenTable.user_id==user_id,
         RefreshTokenTable.token_hash==hash_token,
         RefreshTokenTable.revoked_at.is_(None)
         ).update(
              {RefreshTokenTable.revoked_at:current_time},
               synchronize_session=False
         )
    if update_rows != 1:
        db.rollback()
        raise HTTPException(
            status_code=401,
            detail="Refresh token already revoked"
        )
    try:
        db.commit()
        db.refresh(token_record)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
                status_code=409,
                detail="Refresh token conflicts with an existing record"
            )
    except Exception as e:
        db.rollback()
        logger.exception("Unexpected error during logout")

        raise HTTPException(
            status_code=500,
            detail="Internal Server Error"
        ) from e

    return "User logout successfully"
    






