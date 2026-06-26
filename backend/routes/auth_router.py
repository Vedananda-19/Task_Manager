from fastapi import APIRouter,Depends
from fastapi.security import OAuth2PasswordRequestForm
from services import auth_service
from models import RegisterModel

auth_router = APIRouter(prefix="/auth",tags=["auth"])

@auth_router.post("/login")
def login(formData: OAuth2PasswordRequestForm = Depends()):#For Swagger Docs
    return auth_service.verify_login(formData.username,formData.password)

@auth_router.post("/register")
def login(formData:RegisterModel):
    return auth_service.register_user(formData)

@auth_router.get("/get-users")
def get_users() -> list[str]:
    return auth_service.get_usernames_list()