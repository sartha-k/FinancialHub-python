from pwdlib import PasswordHash
import os
import jwt
import logging
from datetime import datetime,timedelta,timezone
from fastapi import HTTPException,status
from jwt.exceptions import ExpiredSignatureError,InvalidTokenError
from dotenv import load_dotenv
import hashlib
import uuid
load_dotenv()
# Configure the recommended password hashing algorithm
password_hash = PasswordHash.recommended()

logger = logging.getLogger(__name__)
def hash_password(password:str)->str:
    # Convert plaintext password into a secure hash
    return password_hash.hash(password)


def verify_password(password:str,hashed_password:str)->bool:
    # Check whether the supplied password matches the stored hash
    return password_hash.verify(password,hashed_password)
def hash_refresh_token(token:str)->str:
     return hashlib.sha256(token.encode("utf-8").hexdigest())
#Load the signing secret from an environment variable
SECRET_KEY = os.environ["JWT_SECRET_KEY"]

#Algorithm used in sign JWTs
Algorithm = "HS256"

#token validity in minutes

ACCESS_TOKEN_EXPIRE_MINUTES = 30


def create_access_token(user_id:int)->str:
    #Calculate when the token expires
    expire = datetime.now(timezone.utc)+timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )
    #Create JWT paylaod

    payload = {
        "sub":str(user_id),
        "token_type":"access",
        "exp":expire
    }
     #Sign and encode the token
    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=Algorithm
     )
    return token

def create_refresh_token(user_id):
    payload = {
        "sub":str(user_id),
        "token_type":"refresh",
        "jti":str(uuid.uuid4()),
        "exp":datetime.now(timezone.utc) + timedelta(days=7)
    }
    token=jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=Algorithm
    )
    return token,datetime.fromtimestamp(
        payload["exp"].timestamp(),
        tz=timezone.utc
    )


def verify_access_token(token:str)->int:
    try:
        #Verify signature and expiration,then decode claims

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[Algorithm],
            options = {"require":["sub","exp"]}
            )
        if payload.get("token_type")!="access":
            raise HTTPException(
                status_code=401,
                detail="Invalid token type"
            )
        #Extract the user ID from the token
        logger.info("The Payload in verification is %s",payload)
        user_id = int(payload["sub"])
        header = jwt.get_unverified_header(token)
        logger.info("The Header in verification is %s",header)
        return user_id

    except ExpiredSignatureError:
        # Token is correctly signed but has expired
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"}
        )

    except(InvalidTokenError,ValueError,TypeError,KeyError):
        #Invalid signature,missing claims or invalid userId
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token",
            headers={"WWW-Authenticate": "Bearer"}
        )

def verify_refresh_token(token:str):
    try:
        payload = jwt.decode(
                    token,
                    SECRET_KEY,
                    algorithms=[Algorithm],
                    options = {"require":["sub","exp"]}
        )

        if payload.get("token_type")!="refresh":
            raise HTTPException(
                status_code=401,
                detail="Invalid token type"
            )
        user_id = int(payload["sub"])

        return user_id
    except ExpiredSignatureError:
         # Token is correctly signed but has expired
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Refresh token has expired",
                    headers={"WWW-Authenticate": "Bearer"}
                )
        
    except(InvalidTokenError,ValueError,TypeError,KeyError):
                #Invalid signature,missing claims or invalid userId
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid refresh token",
                    headers={"WWW-Authenticate": "Bearer"}
                )

    

