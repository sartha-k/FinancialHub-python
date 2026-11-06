from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from logger_config import logging
from models import UserTable
from schemas import UserCreate, UserLogin
from security import hash_password,verify_password,create_access_token



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
 # 4. Save the user
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
    logger.info("User's Password has verified")

      # Generate JWT for authenticated user
    token = create_access_token(existing_user.id)
    return {
        "access_token":token,
        "token_type":"bearer"
    }