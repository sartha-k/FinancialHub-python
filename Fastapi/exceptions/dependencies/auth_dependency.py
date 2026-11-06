from fastapi import OAuth2PasswordBearer
from fastapi import Depends
from security import verify_access_token
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl = "/api/auth/login"
)

def get_current_user(token:str = Depends(oauth2_scheme)):
    print(token)
    user_id = verify_access_token(token)