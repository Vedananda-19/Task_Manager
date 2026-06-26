from database import db
from models import RegisterModel,UserModel,CurrentUser
from fastapi import HTTPException,Depends
from jose import jwt,JWTError
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime,timedelta,timezone
from bson import ObjectId
from passlib.context import CryptContext
from typing import Annotated
import os

users = db["users"]
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
OAuth2Scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
pwd_context = CryptContext(schemes=["bcrypt"],deprecated="auto")

def get_usernames_list():
    usernames_list:list[str] = []
    for doc in list(users.find()):
        usernames_list.append(doc["username"])
    return usernames_list

def register_user(formData:RegisterModel):
    existing_user = users.find_one({"username":formData.username})
    if existing_user:
        raise HTTPException(400,"Username Already Exists")
    if formData.password!=formData.confirmPassword:
        raise HTTPException(400,"Passwords Dont Match")
    hashed_password = pwd_context.hash(formData.password)
    new_user = UserModel(username=formData.username,password=hashed_password)
    users.insert_one(new_user.model_dump())
    return {"message":"successful"}

def verify_login(username:str,password:str):
    user = users.find_one({"username":username})
    if not user : raise HTTPException(400,"Username does not exist")
    if not pwd_context.verify(password,user["password"]):
        raise HTTPException(400,"Invalid Credentials")
    user["_id"] = str(user["_id"])
    return create_access_token(UserModel.model_validate(user))

def create_access_token(user:UserModel):
    expiry = datetime.now(timezone.utc) + timedelta(hours=5)
    encode_data = {'id':str(user.id),'exp':expiry}
    token : str = jwt.encode(encode_data,JWT_SECRET_KEY,algorithm=ALGORITHM)
    return {"access_token":token,"token_type":"bearer"}

def verify_token(token:str = Depends(OAuth2Scheme)):
    try:
        payload = jwt.decode(token,JWT_SECRET_KEY,algorithms=[ALGORITHM])
        user_id =  payload.get("id")
        if not user_id:
            raise HTTPException(401,"Unauthorized")
        return user_id
    except JWTError:
        raise HTTPException(401,"Token Expired")

def get_current_user(user_id:str=Depends(verify_token)):
    try:
        user = users.find_one({"_id": ObjectId(user_id)},{"username": 1})
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid user ID")
    if not user:
        raise HTTPException(401,"User Not Found")
    user["_id"] = str(user["_id"])
    return CurrentUser(id=str(user["_id"]),username=user["username"])
